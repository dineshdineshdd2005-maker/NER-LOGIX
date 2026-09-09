import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { SeverityLevel, Vehicle, RouteOption } from '../types';
import { NER_OFFLINE_CORRIDORS } from '../data/offlineCorridorData';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Maximize2, 
  RotateCcw, 
  MapPin, 
  AlertTriangle, 
  Truck, 
  CloudRain, 
  Compass,
  Navigation,
  HardDrive,
  Shield,
  Radio,
  Fuel,
  WifiOff,
  CheckCircle2,
  Phone
} from 'lucide-react';

interface LeafletMapProps {
  height?: string;
  showControls?: boolean;
  focusedVehicleId?: string | null;
  interactive?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({ 
  height = '520px', 
  showControls = true,
  focusedVehicleId,
  interactive = true 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const { 
    vehicles, 
    routes, 
    riskZones, 
    weatherStations, 
    alerts, 
    fieldReports, 
    mapFilters, 
    toggleMapFilter,
    rerouteVehicle,
    selectedVehicleId,
    setSelectedVehicleId,
    selectedOfflineCorridorId,
    setSelectedOfflineCorridorId,
    isOffline,
    setActiveTab,
    showToast
  } = useApp();

  const [mapTileTheme, setMapTileTheme] = useState<'carto-voyager' | 'carto-dark' | 'osm' | 'topo' | 'offline-cached'>('carto-voyager');

  // Custom Tactical Offline Canvas Grid Layer that renders local cached topographic contours and grid during network outages
  const createOfflineTileLayer = () => {
    const CustomGridLayer = (L.GridLayer as any).extend({
      createTile: function (coords: { x: number; y: number; z: number }) {
        const tile = document.createElement('canvas');
        const tileSize = this.getTileSize();
        tile.width = tileSize.x;
        tile.height = tileSize.y;
        const ctx = tile.getContext('2d');
        if (!ctx) return tile;

        // Dark tactical relief background (slate-900 / dark GIS)
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, tileSize.x, tileSize.y);

        // Coordinate GIS grid lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        for (let x = 0; x < tileSize.x; x += 64) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, tileSize.y);
        }
        for (let y = 0; y < tileSize.y; y += 64) {
          ctx.moveTo(0, y);
          ctx.lineTo(tileSize.x, y);
        }
        ctx.stroke();

        // Topographic contour curves
        const pseudoHash = Math.abs(coords.x * 13 + coords.y * 19 + coords.z * 7) % 100;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(tileSize.x / 2, tileSize.y / 2, 75 + (pseudoHash % 35), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Elevation label
        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText(`CONTOUR ~${700 + (pseudoHash * 35)}m`, 8, 16);

        // Valley / Drainage simulation
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(0, tileSize.y * 0.65 + (pseudoHash % 25));
        ctx.bezierCurveTo(tileSize.x * 0.35, tileSize.y * 0.55, tileSize.x * 0.65, tileSize.y * 0.8, tileSize.x, tileSize.y * 0.6);
        ctx.stroke();

        // Offline Cache Stamp
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(6, tileSize.y - 24, 160, 18);
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`CACHED TILE z${coords.z} [${coords.x},${coords.y}]`, 10, tileSize.y - 12);

        return tile;
      },
    });

    const layer = new CustomGridLayer({
      maxZoom: 18,
      minZoom: 5,
      attribution: 'NERLogix Tactical Offline Corridors Tile Cache',
    });
    (layer as any)._isOfflineLayer = true;
    return layer;
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered around Western Arunachal & Assam Corridor (lat: 26.9, lng: 92.4, zoom: 7)
    const map = L.map(mapContainerRef.current, {
      center: [26.85, 92.5],
      zoom: 8,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer (supports offline cached tile generator)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layer or offline canvas grid layer
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer || (layer as any)._isOfflineLayer) {
        map.removeLayer(layer);
      }
    });

    if (mapFilters.offlineTiles || mapTileTheme === 'offline-cached') {
      const offlineLayer = createOfflineTileLayer();
      offlineLayer.addTo(map);
    } else {
      let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      if (mapTileTheme === 'carto-dark') {
        tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      } else if (mapTileTheme === 'osm') {
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      } else if (mapTileTheme === 'topo') {
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      }

      const tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 18,
        subdomains: 'abcd',
      });
      tileLayer.addTo(map);
    }
  }, [mapTileTheme, mapFilters.offlineTiles]);

  // Re-render markers, routes, risk zones whenever data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw Routes
    if (mapFilters.routes) {
      routes.forEach((route) => {
        const isRecommended = route.isAiRecommended;
        const color = isRecommended 
          ? '#10b981' // Green
          : route.riskLevel === 'CRITICAL' || route.riskLevel === 'HIGH'
            ? '#ef4444' // Red
            : '#f59e0b'; // Amber

        const weight = isRecommended ? 6 : 4;
        const dashArray = route.riskLevel === 'CRITICAL' ? '8, 8' : undefined;

        const polyline = L.polyline(
          route.coordinates.map((c) => [c.lat, c.lng] as [number, number]),
          {
            color,
            weight,
            opacity: isRecommended ? 0.95 : 0.75,
            dashArray,
          }
        );

        polyline.bindTooltip(`
          <div class="px-2 py-1 text-xs font-semibold">
            <span class="text-xs uppercase tracking-wider ${isRecommended ? 'text-emerald-700 font-bold' : ''}">${route.name}: ${route.title}</span><br/>
            <span class="text-slate-600">${route.distanceKm} km · ${route.estimatedTime} · Risk: ${route.riskLevel}</span>
          </div>
        `, { sticky: true });

        polyline.addTo(layerGroup);
      });
    }

    // 2. Draw Risk Zones
    if (mapFilters.riskZones) {
      riskZones.forEach((zone) => {
        const color = 
          zone.severity === 'CRITICAL' ? '#dc2626' :
          zone.severity === 'HIGH' ? '#ea580c' :
          zone.severity === 'MEDIUM' ? '#d97706' : '#059669';

        const circle = L.circle([zone.center.lat, zone.center.lng], {
          radius: zone.radiusKm * 1000,
          color,
          fillColor: color,
          fillOpacity: 0.16,
          weight: 2,
          dashArray: '4, 6',
        });

        circle.bindPopup(`
          <div class="p-2 font-sans">
            <div class="flex items-center gap-1.5 font-bold text-slate-900 text-sm">
              <span class="inline-block w-2.5 h-2.5 rounded-full" style="background:${color}"></span>
              ${zone.name}
            </div>
            <div class="text-xs text-slate-600 mt-1 font-medium">Type: <span class="font-bold text-slate-800">${zone.riskType}</span></div>
            <div class="text-xs text-slate-600">Severity: <span class="font-bold uppercase" style="color:${color}">${zone.severity}</span></div>
            <p class="text-xs text-slate-500 mt-1 leading-snug">${zone.description}</p>
          </div>
        `);

        circle.addTo(layerGroup);
      });
    }

    // 3. Draw Vehicles
    if (mapFilters.vehicles) {
      vehicles.forEach((v) => {
        const isSelected = v.id === selectedVehicleId || v.id === focusedVehicleId;
        const color = 
          v.riskLevel === 'CRITICAL' ? '#dc2626' :
          v.riskLevel === 'HIGH' ? '#ea580c' :
          v.riskLevel === 'MEDIUM' ? '#d97706' : '#10b981';

        const customVehicleIcon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-125" style="width: 38px; height: 38px;">
              ${isSelected ? `<span class="absolute inline-flex h-10 w-10 rounded-full animate-ping opacity-60" style="background-color: ${color}"></span>` : ''}
              <div class="relative w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white" style="background: ${color}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                  <path d="M15 18H9"/>
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                  <circle cx="17" cy="18" r="2"/>
                  <circle cx="7" cy="18" r="2"/>
                </svg>
              </div>
              <div class="absolute -bottom-4 bg-slate-900/90 text-[10px] font-bold text-white px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-slate-700">
                ${v.id}
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

        const marker = L.marker([v.coords.lat, v.coords.lng], { icon: customVehicleIcon });

        marker.on('click', () => {
          setSelectedVehicleId(v.id);
        });

        marker.bindPopup(`
          <div class="p-3 font-sans min-w-[240px]">
            <div class="flex items-center justify-between border-b pb-2 mb-2">
              <span class="font-bold text-slate-900 text-sm">${v.id}</span>
              <span class="text-xs px-2 py-0.5 rounded-full font-bold uppercase" style="background: ${color}20; color: ${color};">${v.riskLevel} RISK</span>
            </div>
            <div class="space-y-1 text-xs text-slate-700">
              <p><span class="text-slate-500 font-medium">Plate:</span> ${v.plateNumber}</p>
              <p><span class="text-slate-500 font-medium">Driver:</span> ${v.driverName} (${v.driverPhone})</p>
              <p><span class="text-slate-500 font-medium">Current:</span> ${v.currentLocationName}</p>
              <p><span class="text-slate-500 font-medium">Destination:</span> ${v.destinationName}</p>
              <p><span class="text-slate-500 font-medium">Speed:</span> <span class="font-bold text-blue-600">${v.speedKmH} km/h</span> · ETA: ${v.eta}</p>
              <p><span class="text-slate-500 font-medium">Cargo:</span> ${v.cargoType} (${v.cargoPriority})</p>
            </div>
            ${v.riskLevel === 'HIGH' || v.riskLevel === 'CRITICAL' ? `
              <div class="mt-3 pt-2 border-t">
                <button 
                  id="btn-reroute-${v.id}"
                  class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 px-3 rounded text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  Reroute to Safe Corridor B
                </button>
              </div>
            ` : ''}
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-reroute-${v.id}`);
          if (btn) {
            btn.onclick = () => {
              rerouteVehicle(v.id, 'route-b');
              map.closePopup();
            };
          }
        });

        marker.addTo(layerGroup);
      });
    }

    // 4. Draw Blocked Roads / Landslides
    if (mapFilters.roadBlocks || mapFilters.landslides) {
      alerts
        .filter(a => a.severity === 'CRITICAL' || a.title.toLowerCase().includes('landslide') || a.title.toLowerCase().includes('block'))
        .forEach((alert) => {
          const hazardIcon = L.divIcon({
            className: 'custom-hazard-marker',
            html: `
              <div class="relative flex items-center justify-center cursor-pointer animate-bounce" style="width: 32px; height: 32px;">
                <div class="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-amber-300">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const hazardMarker = L.marker([alert.coords.lat, alert.coords.lng], { icon: hazardIcon });
          hazardMarker.bindPopup(`
            <div class="p-2 font-sans max-w-[220px]">
              <span class="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">ROAD BLOCKAGE</span>
              <h4 class="font-bold text-slate-900 text-xs mt-1">${alert.title}</h4>
              <p class="text-xs text-slate-600 mt-1">${alert.description}</p>
              <div class="mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-1.5 rounded">
                Action: ${alert.recommendedAction}
              </div>
            </div>
          `);
          hazardMarker.addTo(layerGroup);
        });
    }

    // 5. Draw Weather Stations
    if (mapFilters.weather) {
      weatherStations.forEach((ws) => {
        const isRainHigh = ws.rainfallMmHr > 25;
        const weatherIcon = L.divIcon({
          className: 'custom-weather-marker',
          html: `
            <div class="bg-blue-600/90 hover:bg-blue-700 text-white p-1 rounded-md shadow border border-blue-300 text-[10px] flex items-center gap-1 cursor-pointer whitespace-nowrap">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                <path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>
              </svg>
              <span class="font-bold">${ws.rainfallMmHr} mm/h</span>
            </div>
          `,
          iconSize: [70, 24],
          iconAnchor: [35, 12],
        });

        const weatherMarker = L.marker([ws.coords.lat, ws.coords.lng], { icon: weatherIcon });
        weatherMarker.bindPopup(`
          <div class="p-2 font-sans text-xs">
            <div class="font-bold text-slate-900">${ws.locationName} (${ws.state})</div>
            <div class="text-slate-600 mt-1">Rainfall: <b>${ws.rainfallMmHr} mm/hr</b></div>
            <div class="text-slate-600">Temp: <b>${ws.temperatureC}°C</b> · Wind: <b>${ws.windSpeedKmH} km/h</b></div>
            <div class="text-slate-600">Landslide Hazard: <b class="${ws.landslideProbabilityPercent > 60 ? 'text-red-600' : 'text-slate-800'}">${ws.landslideProbabilityPercent}%</b></div>
            <div class="text-slate-600">Road State: <b>${ws.roadCondition}</b></div>
          </div>
        `);
        weatherMarker.addTo(layerGroup);
      });
    }

    // 6. Draw Field Reports
    if (mapFilters.fieldReports) {
      fieldReports.forEach((report) => {
        const reportIcon = L.divIcon({
          className: 'custom-field-marker',
          html: `
            <div class="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:scale-110">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const reportMarker = L.marker([report.coords.lat, report.coords.lng], { icon: reportIcon });
        reportMarker.bindPopup(`
          <div class="p-2 font-sans text-xs max-w-[240px]">
            <div class="flex items-center justify-between border-b pb-1 mb-1">
              <span class="font-bold text-purple-700">${report.id} · ${report.reportType}</span>
              <span class="text-[10px] text-slate-500">${report.timestamp}</span>
            </div>
            <div class="text-slate-800 font-medium">${report.locationName}</div>
            <p class="text-slate-600 mt-1">${report.description}</p>
            <div class="mt-2 text-[10px] text-slate-500 flex items-center justify-between bg-slate-100 p-1 rounded">
              <span>Officer: ${report.officerName}</span>
              <span class="font-mono text-purple-800 font-bold">${report.officerBadge}</span>
            </div>
          </div>
        `);
        reportMarker.addTo(layerGroup);
      });
    }

    // 7. Draw Offline Cached Key Corridors & Emergency Refuges
    if (mapFilters.offlineTiles) {
      const corridorsToRender = selectedOfflineCorridorId && selectedOfflineCorridorId !== 'all'
        ? NER_OFFLINE_CORRIDORS.filter(c => c.id === selectedOfflineCorridorId)
        : NER_OFFLINE_CORRIDORS;

      corridorsToRender.forEach(corridor => {
        const isSafeBypass = corridor.id === 'corridor-sh5';
        const outerColor = isSafeBypass ? '#10b981' : '#38bdf8';
        const innerColor = isSafeBypass ? '#059669' : '#0284c7';

        // Glowing outer buffer representing the pre-cached spatial corridor
        const bufferPolyline = L.polyline(
          corridor.coordinates.map(c => [c.lat, c.lng] as [number, number]),
          {
            color: outerColor,
            weight: 18,
            opacity: 0.28,
            lineCap: 'round',
            lineJoin: 'round',
          }
        );
        bufferPolyline.addTo(layerGroup);

        // Crisp centerline with waypoint pulse
        const centerPolyline = L.polyline(
          corridor.coordinates.map(c => [c.lat, c.lng] as [number, number]),
          {
            color: innerColor,
            weight: 4,
            opacity: 0.95,
          }
        );

        centerPolyline.bindTooltip(`
          <div class="px-2.5 py-1.5 font-sans text-xs">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="font-bold text-slate-900 uppercase tracking-wide">${corridor.name}</span>
            </div>
            <div class="text-slate-600 text-[11px] mt-0.5">
              ${corridor.lengthKm} km · ${corridor.tileCount} Tiles in Device Cache (${corridor.sizeMb}MB)
            </div>
            <div class="text-[10px] text-emerald-700 font-semibold mt-0.5">
              ${corridor.shelters.length} Emergency Refuges · ${corridor.sosCallboxesCount || 12} NavIC SOS Boxes
            </div>
          </div>
        `, { sticky: true });

        centerPolyline.addTo(layerGroup);

        // Render Offline Shelters, BRO Outposts, & Fuel Bays
        corridor.shelters.forEach(shelter => {
          const isBRO = shelter.type === 'BRO Outpost';
          const isMed = shelter.type === 'Medical Emergency';
          const isFuel = shelter.type === 'Fuel & Mechanical';
          const isSos = shelter.type === 'Satellite SOS';

          const badgeBg = isBRO ? '#d97706' : isMed ? '#059669' : isFuel ? '#2563eb' : isSos ? '#4f46e5' : '#7c3aed';
          const badgeLetter = isBRO ? 'BRO' : isMed ? 'MED' : isFuel ? 'FUEL' : isSos ? 'SOS' : 'REFUGE';
          const markerLabel = shelter.kmMarker !== undefined ? `Km ${shelter.kmMarker}` : shelter.highway;

          const shelterIcon = L.divIcon({
            className: 'offline-shelter-marker',
            html: `
              <div class="relative flex flex-col items-center cursor-pointer transition-transform hover:scale-125" style="width: 44px;">
                <div class="px-1.5 py-0.5 rounded text-white font-mono font-black text-[9px] shadow-md border border-white tracking-tighter" style="background: ${badgeBg};">
                  ${badgeLetter}
                </div>
                <div class="w-2 h-2 rotate-45 border-r border-b border-white -mt-1" style="background: ${badgeBg};"></div>
                <div class="mt-0.5 bg-slate-950/90 text-[8px] font-mono text-white px-1 rounded shadow-xs whitespace-nowrap">
                  ${markerLabel}
                </div>
              </div>
            `,
            iconSize: [44, 30],
            iconAnchor: [22, 15],
          });

          const shelterMarker = L.marker([shelter.coords.lat, shelter.coords.lng], { icon: shelterIcon });

          shelterMarker.bindPopup(`
            <div class="p-3 font-sans min-w-[250px] text-xs">
              <div class="flex items-start justify-between border-b border-slate-200 pb-1.5 mb-2">
                <div>
                  <span class="font-bold text-slate-900 text-sm block">${shelter.name}</span>
                  <span class="text-[10px] text-slate-500 font-mono">${shelter.highway} ${shelter.kmMarker !== undefined ? '· Km ' + shelter.kmMarker : ''} · Elev: ${shelter.elevationM}m</span>
                </div>
                <span class="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white" style="background: ${badgeBg}">
                  ${shelter.type}
                </span>
              </div>
              <div class="space-y-1.5 text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-slate-500">VHF Wireless:</span>
                  <span class="font-mono font-bold text-indigo-700 text-[11px]">${shelter.vhfChannel}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-slate-500">Iridium Sat Phone:</span>
                  <span class="font-mono font-bold text-emerald-700 text-[11px]">${shelter.satellitePhone}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-slate-500">Beds & Staging:</span>
                  <span class="font-bold text-slate-800 text-[11px]">${shelter.capacityBeds} Emergency Beds</span>
                </div>
              </div>
              <div class="mt-2 pt-1 border-t border-slate-200">
                <span class="text-[10px] font-semibold text-slate-500 block mb-1">On-Site Logistics Support:</span>
                <div class="flex flex-wrap gap-1">
                  ${shelter.services.map(s => `<span class="text-[9px] bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-medium">${s}</span>`).join('')}
                </div>
              </div>
            </div>
          `);

          shelterMarker.addTo(layerGroup);
        });
      });
    }

  }, [vehicles, routes, riskZones, weatherStations, alerts, fieldReports, mapFilters, selectedVehicleId, focusedVehicleId, selectedOfflineCorridorId]);

  // Center or fit bounds on selected offline corridor
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedOfflineCorridorId) return;
    if (selectedOfflineCorridorId === 'all') {
      mapInstanceRef.current.flyTo([26.85, 92.5], 8, { duration: 1.2 });
      return;
    }
    const target = NER_OFFLINE_CORRIDORS.find(c => c.id === selectedOfflineCorridorId);
    if (target && target.coordinates.length > 0) {
      const bounds = L.latLngBounds(target.coordinates.map(c => [c.lat, c.lng] as [number, number]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10, duration: 1.2 });
    }
  }, [selectedOfflineCorridorId]);

  // Center on focused vehicle if provided
  useEffect(() => {
    if (!focusedVehicleId || !mapInstanceRef.current) return;
    const target = vehicles.find(v => v.id === focusedVehicleId);
    if (target) {
      mapInstanceRef.current.flyTo([target.coords.lat, target.coords.lng], 10, { duration: 1.2 });
    }
  }, [focusedVehicleId, vehicles]);

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([26.85, 92.5], 8, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
      {/* Top Map Action Bar */}
      {showControls && (
        <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 shadow-md text-xs text-slate-800">
          <div className="flex items-center gap-1 font-semibold text-slate-700 pr-2 border-r border-slate-200">
            <Navigation className="w-3.5 h-3.5 text-indigo-600" />
            <span>GIS Layers</span>
          </div>

          <button
            onClick={() => toggleMapFilter('vehicles')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition cursor-pointer ${
              mapFilters.vehicles ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold' : 'bg-slate-100 text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <Truck className="w-3 h-3" /> Vehicles
          </button>

          <button
            onClick={() => toggleMapFilter('routes')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition cursor-pointer ${
              mapFilters.routes ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' : 'bg-slate-100 text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <Compass className="w-3 h-3" /> Corridors
          </button>

          <button
            onClick={() => toggleMapFilter('weather')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition cursor-pointer ${
              mapFilters.weather ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold' : 'bg-slate-100 text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <CloudRain className="w-3 h-3" /> Weather
          </button>

          <button
            onClick={() => toggleMapFilter('roadBlocks')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition cursor-pointer ${
              mapFilters.roadBlocks ? 'bg-red-50 text-red-700 border border-red-200 font-bold' : 'bg-slate-100 text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <AlertTriangle className="w-3 h-3" /> Blockades
          </button>

          <button
            onClick={() => toggleMapFilter('riskZones')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition cursor-pointer ${
              mapFilters.riskZones ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold' : 'bg-slate-100 text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3 h-3" /> Geo-Risk
          </button>

          <button
            onClick={() => toggleMapFilter('fieldReports')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition cursor-pointer ${
              mapFilters.fieldReports ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold' : 'bg-slate-100 text-slate-500 hover:bg-slate-200/60'
            }`}
          >
            <MapPin className="w-3 h-3" /> Field Reports
          </button>

          {/* Offline Mode Map Layer Toggle */}
          <button
            onClick={() => toggleMapFilter('offlineTiles')}
            className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition cursor-pointer ${
              mapFilters.offlineTiles ? 'bg-amber-100 text-amber-900 border border-amber-400 font-bold shadow-2xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200/60'
            }`}
            title="Toggle Cached Map Tiles for Key Corridors (Zero Network)"
          >
            <HardDrive className="w-3 h-3 text-amber-600" />
            <span>Offline Tiles (51MB)</span>
          </button>
        </div>
      )}

      {/* Map Controls (Theme Switcher & Reset) */}
      {showControls && (
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-lg border border-slate-200 shadow-md text-xs">
          <select
            value={mapTileTheme}
            onChange={(e) => setMapTileTheme(e.target.value as any)}
            className="bg-slate-50 text-slate-700 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium"
          >
            <option value="carto-voyager">Light GIS (Voyager)</option>
            <option value="carto-dark">Tactical Dark</option>
            <option value="osm">OpenStreetMap</option>
            <option value="topo">Topographic Relief</option>
            <option value="offline-cached">Offline Topo (Cached 51MB)</option>
          </select>

          <button
            onClick={resetView}
            title="Reset to Regional Overview"
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* In-Map Offline Navigation Mode Tactical HUD */}
      {mapFilters.offlineTiles && (
        <div className="absolute top-14 left-3 right-3 sm:right-auto sm:max-w-md z-[999] bg-slate-950/92 backdrop-blur-md text-white px-3.5 py-2.5 rounded-lg border border-amber-500/50 shadow-xl space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                Offline Tactical Map Tiles Active
              </span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              NavIC L5 / GPS
            </span>
          </div>

          <div className="text-[11px] text-slate-300 flex items-center justify-between">
            <span>Cached Corridors: <b>NH-13, SH-5, NH-27, Sela</b></span>
            <span className="font-mono text-amber-300 font-semibold">5,800 Tiles (51MB)</span>
          </div>

          {/* Quick Corridor Focus Buttons */}
          <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800 text-[10px]">
            <span className="text-slate-400">Focus Corridor:</span>
            {[
              { id: 'all', label: 'All Corridors' },
              { id: 'corridor-nh13', label: 'NH-13' },
              { id: 'corridor-sh5', label: 'SH-5 Safe Bypass' },
              { id: 'corridor-nh27', label: 'NH-27' },
              { id: 'corridor-sela-tunnel', label: 'Sela Tunnel' }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedOfflineCorridorId(c.id)}
                className={`px-1.5 py-0.5 rounded font-mono transition cursor-pointer ${
                  selectedOfflineCorridorId === c.id
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map Canvas Container */}
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%' }} 
        className="z-0"
      />

      {/* Map Bottom Legend */}
      <div className="absolute bottom-2 left-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-slate-200 text-[11px] flex flex-wrap items-center gap-3 text-slate-700 shadow-xs">
        <span className="text-slate-500 font-bold">Legend:</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Safe / AI Route
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Moderate
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span> High Risk
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Critical Blockade
        </span>
        {mapFilters.offlineTiles && (
          <span className="flex items-center gap-1 text-sky-700 font-semibold border-l border-slate-200 pl-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span> Cached Corridor Ribbon
          </span>
        )}
      </div>
    </div>
  );
};
