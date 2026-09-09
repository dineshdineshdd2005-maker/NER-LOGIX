import { 
  DistrictSupplyDepot, 
  InventoryItem, 
  RedistributionSuggestion, 
  WeatherStation, 
  AlertItem, 
  FieldReport, 
  RiskZone 
} from '../types';

export interface CrossReferenceResult {
  depotsWithUpdatedRisk: DistrictSupplyDepot[];
  suggestions: RedistributionSuggestion[];
  summary: {
    criticalDepotsCount: number;
    isolatedDepotsCount: number;
    totalStockDeficitTons: number;
    activeDisruptionsCorrelated: number;
    lastEvaluationTime: string;
  };
}

/**
 * Cross-references supply chain inventory data with incoming weather & disruption reports.
 * Automatically computes isolation vulnerabilities and generates recommended inventory reallocations.
 */
export function evaluateSupplyChainCrossReference(
  depots: DistrictSupplyDepot[],
  weatherStations: WeatherStation[],
  alerts: AlertItem[],
  fieldReports: FieldReport[],
  riskZones: RiskZone[]
): CrossReferenceResult {
  const suggestions: RedistributionSuggestion[] = [];
  let totalDeficitTons = 0;
  let activeDisruptionsCorrelated = 0;

  // 1. Evaluate each depot's access corridors and weather threat
  const updatedDepots = depots.map((depot) => {
    // If it's a regional surplus hub or mother warehouse, it's not isolated
    if (depot.depotType === 'Mother Central Hub' || depot.depotType === 'Regional Buffer Warehouse') {
      return {
        ...depot,
        isolationRiskScore: 12,
        isIsolated: false,
        activeDisruptionCount: 0,
        estimatedBlockadeHours: 0,
      };
    }

    // Correlate with alerts referencing this depot's district or dependent corridors
    const relevantAlerts = alerts.filter((a) => {
      const text = `${a.title} ${a.description} ${a.locationName}`.toLowerCase();
      const districtMatch = text.includes(depot.district.toLowerCase()) || text.includes(depot.name.toLowerCase());
      const corridorMatch = depot.dependentCorridors.some((c) => {
        const cCode = c.split(' ')[0].toLowerCase(); // e.g. "nh-13" or "sh-5"
        return text.includes(cCode);
      });
      return districtMatch || corridorMatch;
    });

    // Correlate with field reports
    const relevantReports = fieldReports.filter((r) => {
      const text = `${r.roadName} ${r.locationName} ${r.description}`.toLowerCase();
      const districtMatch = text.includes(depot.district.toLowerCase());
      const corridorMatch = depot.dependentCorridors.some((c) => {
        const cCode = c.split(' ')[0].toLowerCase();
        return text.includes(cCode);
      });
      return districtMatch || corridorMatch;
    });

    // Correlate with weather stations nearby (within ~1.2 degrees lat/lng)
    const nearbyStations = weatherStations.filter((ws) => {
      const dLat = Math.abs(ws.coords.lat - depot.coords.lat);
      const dLng = Math.abs(ws.coords.lng - depot.coords.lng);
      return dLat < 1.2 && dLng < 1.2;
    });

    const maxRainfall = nearbyStations.reduce((max, ws) => Math.max(max, ws.rainfallMmHr), 0);
    const maxLandslideProb = nearbyStations.reduce((max, ws) => Math.max(max, ws.landslideProbabilityPercent), 0);
    const hasFloodWarning = nearbyStations.some((ws) => ws.floodWarning);

    // Calculate estimated blockade hours based on disruptions
    let blockadeHours = 0;
    const disruptionCount = relevantAlerts.length + relevantReports.length;
    activeDisruptionsCorrelated += disruptionCount;

    if (disruptionCount > 0) {
      blockadeHours = Math.min(120, 24 + disruptionCount * 24 + (maxRainfall > 35 ? 24 : 0));
    } else if (maxRainfall > 40 || maxLandslideProb > 70) {
      blockadeHours = 36;
    }

    // Compute isolation risk score (0-100)
    let isolationScore = 15;
    if (blockadeHours > 72) isolationScore = 88;
    else if (blockadeHours > 48) isolationScore = 75;
    else if (blockadeHours > 24) isolationScore = 60;
    else if (maxRainfall > 30) isolationScore = 45;

    if (hasFloodWarning) isolationScore = Math.min(98, isolationScore + 10);
    if (relevantAlerts.some((a) => a.severity === 'CRITICAL')) {
      isolationScore = Math.min(99, isolationScore + 15);
    }

    const isIsolated = isolationScore >= 65 || blockadeHours >= 48;

    // Recalculate inventory days remaining and status
    const updatedInventory = depot.inventory.map((item) => {
      const days = Number((item.currentStock / (item.dailyBurnRate || 1)).toFixed(1));
      let status: InventoryItem['status'] = 'ADEQUATE';

      if (days < 2.5) status = 'CRITICAL';
      else if (days < 4.5) status = 'LOW';
      else if (days < 8.0) status = 'MODERATE';

      return {
        ...item,
        daysOfStockRemaining: days,
        status,
      };
    });

    return {
      ...depot,
      isolationRiskScore: isolationScore,
      isIsolated,
      activeDisruptionCount: disruptionCount,
      estimatedBlockadeHours: blockadeHours,
      inventory: updatedInventory,
    };
  });

  // 2. Identify Deficit Remote Depots and Match with Surplus Hubs
  const surplusHubs = updatedDepots.filter(
    (d) => d.depotType === 'Regional Buffer Warehouse' || d.depotType === 'Mother Central Hub'
  );

  const remoteDepots = updatedDepots.filter(
    (d) => d.depotType === 'Remote Hill Depot' || d.depotType === 'Forward Border Staging Post'
  );

  remoteDepots.forEach((remoteDepot) => {
    remoteDepot.inventory.forEach((item) => {
      const projectedBlockadeDays = (remoteDepot.estimatedBlockadeHours || 24) / 24;
      const safeBufferHorizonDays = Math.max(7, projectedBlockadeDays + 3);

      // Trigger condition: item will exhaust during projected blockade window or is already LOW/CRITICAL
      const willExhaustDuringCutoff = item.daysOfStockRemaining <= projectedBlockadeDays + 1.5;
      const isVulnerable = item.status === 'CRITICAL' || item.status === 'LOW' || willExhaustDuringCutoff;

      if (isVulnerable && remoteDepot.isolationRiskScore >= 50) {
        // Find best source surplus hub containing this item category with sufficient buffer
        const bestSourceHub = surplusHubs.find((hub) => {
          const matchingItem = hub.inventory.find(
            (hItem) => hItem.category === item.category && hItem.daysOfStockRemaining > 12
          );
          return !!matchingItem;
        }) || surplusHubs[0];

        if (!bestSourceHub) return;

        // Calculate transfer quantity to restore remote depot to safe horizon (e.g. 7-10 days buffer)
        const targetDays = 7.5;
        const deficitDays = Math.max(1, targetDays - item.daysOfStockRemaining);
        const transferQty = Math.round(deficitDays * item.dailyBurnRate);

        // Approximate deficit in tons for summary metric
        if (item.unit === 'Tons') {
          totalDeficitTons += transferQty;
        } else if (item.unit === 'Liters') {
          totalDeficitTons += transferQty / 1200;
        } else {
          totalDeficitTons += (transferQty * 0.005);
        }

        // Determine urgency
        let urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' = 'MEDIUM';
        if (item.daysOfStockRemaining < 2.2 || (remoteDepot.isIsolated && item.status === 'CRITICAL')) {
          urgency = 'CRITICAL';
        } else if (item.daysOfStockRemaining < 4.0 || remoteDepot.estimatedBlockadeHours >= 48) {
          urgency = 'HIGH';
        }

        // Determine recommended transport mode
        let transportMode: RedistributionSuggestion['transportMode'] = '4WD 5-Ton Convoy';
        if (item.storageRequirement === 'Refrigerated Cold-Chain (2-8°C)') {
          transportMode = 'Refrigerated Cold-Chain Van';
        } else if (item.category === 'Fuel & Energy') {
          transportMode = 'Fuel Tanker Carrier';
        } else if (remoteDepot.estimatedBlockadeHours >= 96 && remoteDepot.isolationRiskScore >= 85) {
          transportMode = 'Emergency Helicopter Air-Drop';
        }

        // Determine recommended route
        let routeRecommendation = 'Tezpur - Kalaktang (SH-5 Safe Bypass)';
        if (remoteDepot.id === 'depot-tawang') {
          routeRecommendation = 'Tezpur Staging Depot → SH-5 Kalaktang Bypass → Shergaon → Sela Twin-Bore Tunnel (avoiding NH-13 Bhalukpong slide zone)';
        } else if (remoteDepot.id === 'depot-anini') {
          routeRecommendation = 'Jorhat / Tezu Depot → NH-313 Roing Valley Road with heavy BRO escort before evening cloudburst';
        } else if (remoteDepot.id === 'depot-ziro') {
          routeRecommendation = 'Tezpur Depot → NH-15 North Bank Arterial → Potin Bypass';
        } else {
          routeRecommendation = `${bestSourceHub.name} → Arterial All-Weather Corridor`;
        }

        // Build list of triggering disruptions
        const triggeringDisruptions: string[] = [];
        if (remoteDepot.estimatedBlockadeHours > 0) {
          triggeringDisruptions.push(`Projected corridor blockade duration: ${remoteDepot.estimatedBlockadeHours} hours`);
        }
        if (remoteDepot.activeDisruptionCount > 0) {
          triggeringDisruptions.push(`${remoteDepot.activeDisruptionCount} verified road slips & rockfall notices`);
        }
        triggeringDisruptions.push(`Current stock depleted to ${item.daysOfStockRemaining} days vs minimum safe horizon of ${targetDays} days`);

        const suggestionId = `redist-${bestSourceHub.id.replace('depot-', '')}-${remoteDepot.id.replace('depot-', '')}-${item.id}`;

        suggestions.push({
          id: suggestionId,
          sourceDepotId: bestSourceHub.id,
          sourceDepotName: bestSourceHub.name,
          targetDepotId: remoteDepot.id,
          targetDepotName: remoteDepot.name,
          commodityId: item.id,
          commodityName: item.name,
          category: item.category,
          transferQuantity: transferQty,
          unit: item.unit,
          urgency,
          reason: `Imminent supply stockout risk during projected ${remoteDepot.estimatedBlockadeHours}h corridor cutoff. Current stock of ${item.name} will run out in ${item.daysOfStockRemaining} days.`,
          triggeringDisruptions,
          currentStockDays: item.daysOfStockRemaining,
          projectedStockDaysAfter: targetDays,
          recommendedRoute: routeRecommendation,
          transportMode,
          estimatedTransitHours: remoteDepot.elevationM > 2500 ? 9 : 5.5,
          deadlineHours: Math.max(3, Math.round(item.daysOfStockRemaining * 18)),
          status: 'PENDING_APPROVAL',
        });
      }
    });
  });

  // Sort suggestions by urgency (CRITICAL first, then HIGH, then MEDIUM)
  const urgencyWeight = { CRITICAL: 3, HIGH: 2, MEDIUM: 1 };
  suggestions.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);

  const criticalDepotsCount = updatedDepots.filter((d) => d.isolationRiskScore >= 75).length;
  const isolatedDepotsCount = updatedDepots.filter((d) => d.isIsolated).length;

  return {
    depotsWithUpdatedRisk: updatedDepots,
    suggestions,
    summary: {
      criticalDepotsCount,
      isolatedDepotsCount,
      totalStockDeficitTons: Number(totalDeficitTons.toFixed(1)),
      activeDisruptionsCorrelated,
      lastEvaluationTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    },
  };
}
