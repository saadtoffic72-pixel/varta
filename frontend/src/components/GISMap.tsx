import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  Circle,
  Tooltip
} from 'react-leaflet';
import L from 'leaflet';
import { CycloneDetail, CoastalZone } from '../types';
import { CycloneBadge } from './CycloneBadge';
import { Layers, Eye, ShieldAlert, Wind, Compass } from 'lucide-react';

// Custom icons using standard Leaflet DivIcon to avoid asset loading issues
const createVortexIcon = (color: string) =>
  L.divIcon({
    className: 'custom-vortex-marker',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: ${color};
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 16px ${color};
      animation: pulse 1.5s infinite;
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const createWaypointIcon = (color: string) =>
  L.divIcon({
    className: 'custom-waypoint-marker',
    html: `<div style="
      width: 12px;
      height: 12px;
      background: ${color};
      border-radius: 50%;
      border: 2px solid white;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

interface GISMapProps {
  cyclone?: CycloneDetail | null;
  coastalZones?: CoastalZone[];
  height?: string;
  selectedStep?: number;
}

export const GISMap: React.FC<GISMapProps> = ({
  cyclone,
  coastalZones = [],
  height = '520px',
}) => {
  const [showCone, setShowCone] = useState(true);
  const [showWindRadii, setShowWindRadii] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  // Default center: Bay of Bengal (or Arabian Sea if basin matches)
  const defaultCenter: [number, number] = cyclone?.basin === 'Arabian Sea' ? [18.0, 68.0] : [18.5, 87.0];
  const zoomLevel = 5;

  // Track points coordinates
  const pastCoords: [number, number][] =
    cyclone?.track_points?.map((pt) => [pt.latitude, pt.longitude]) || [];

  const latestPt = cyclone?.track_points?.[cyclone.track_points.length - 1];

  // Forecast points coordinates
  const forecastCoords: [number, number][] =
    cyclone?.forecast_points?.map((fp) => [fp.latitude, fp.longitude]) || [];

  // Combined track line from latest point into forecast
  const connectionCoords: [number, number][] =
    latestPt && forecastCoords.length > 0
      ? [[latestPt.latitude, latestPt.longitude], ...forecastCoords]
      : [];

  // Cone coordinates from forecast points
  // Construct polygon bounds around forecast points
  const conePolygonCoords: [number, number][] = [];
  if (cyclone?.forecast_points && cyclone.forecast_points.length > 0 && latestPt) {
    const leftSide: [number, number][] = [];
    const rightSide: [number, number][] = [];

    leftSide.push([latestPt.latitude, latestPt.longitude]);
    rightSide.push([latestPt.latitude, latestPt.longitude]);

    cyclone.forecast_points.forEach((fp) => {
      const offsetDeg = fp.cone_radius_km / 111.0;
      leftSide.push([fp.latitude + offsetDeg * 0.7, fp.longitude - offsetDeg * 0.9]);
      rightSide.push([fp.latitude - offsetDeg * 0.7, fp.longitude + offsetDeg * 0.9]);
    });

    conePolygonCoords.push(...leftSide, ...rightSide.reverse());
  }

  return (
    <div className="relative rounded-2xl overflow-hidden glass-panel border border-slate-800" style={{ height }}>
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-wrap gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700/70 text-xs">
        <button
          onClick={() => setShowCone(!showCone)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition ${
            showCone
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>70% Cone</span>
        </button>

        <button
          onClick={() => setShowWindRadii(!showWindRadii)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition ${
            showWindRadii
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Wind Radii</span>
        </button>

        <button
          onClick={() => setShowShelters(!showShelters)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition ${
            showShelters
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Coastal Risk</span>
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/85 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5 shadow-lg">
        <div className="font-semibold text-white mb-1 flex items-center space-x-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>GIS Diagnostic Layers</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-0.5 bg-cyan-400" />
          <span>Observed Track Line</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-0.5 bg-amber-400" />
          <span>AI Forecast Track</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-sm bg-amber-500/25 border border-amber-500" />
          <span>Cone of Uncertainty</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span>Eye / Landfall Target</span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={zoomLevel}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {/* Dark Satellite Basemap via CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> | IMD Data'
          url={`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${
            import.meta.env.VITE_CARTO_API_KEY ? `?key=${import.meta.env.VITE_CARTO_API_KEY}` : ''
          }`}
          maxZoom={18}
        />

        {/* 1. Past Track Polyline */}
        {pastCoords.length > 1 && (
          <Polyline
            positions={pastCoords}
            pathOptions={{ color: '#06b6d4', weight: 3, dashArray: '4, 6', opacity: 0.8 }}
          />
        )}

        {/* 2. Forecast Connection Line */}
        {connectionCoords.length > 1 && (
          <Polyline
            positions={connectionCoords}
            pathOptions={{ color: '#f59e0b', weight: 3.5, opacity: 0.95 }}
          />
        )}

        {/* 3. Uncertainty Cone Polygon */}
        {showCone && conePolygonCoords.length > 2 && (
          <Polygon
            positions={conePolygonCoords}
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#f59e0b',
              fillOpacity: 0.18,
              weight: 1.5,
              dashArray: '3, 4',
            }}
          />
        )}

        {/* 4. Past Track Markers */}
        {cyclone?.track_points?.map((pt, idx) => (
          <Marker
            key={`past-${pt.id || idx}`}
            position={[pt.latitude, pt.longitude]}
            icon={createWaypointIcon('#06b6d4')}
          >
            <Popup>
              <div className="p-1 text-slate-100 text-xs">
                <div className="font-bold text-cyan-400 mb-1">{cyclone.name} (Observation)</div>
                <div>Category: <span className="font-semibold">{pt.intensity_category}</span></div>
                <div>Wind Speed: <span className="font-mono">{pt.wind_speed_knots} kts</span> ({Math.round(pt.wind_speed_knots * 1.852)} km/h)</div>
                <div>Pressure: <span className="font-mono">{pt.central_pressure_hpa} hPa</span></div>
                <div>Time: <span className="text-slate-400">{new Date(pt.timestamp).toUTCString()}</span></div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 5. Forecast Waypoints */}
        {cyclone?.forecast_points?.map((fp, idx) => (
          <Marker
            key={`forecast-${fp.id || idx}`}
            position={[fp.latitude, fp.longitude]}
            icon={createWaypointIcon('#f59e0b')}
          >
            <Popup>
              <div className="p-1 text-slate-100 text-xs">
                <div className="font-bold text-amber-400 mb-1">
                  {cyclone.name} (+{fp.forecast_time_hours}h Forecast)
                </div>
                <div>Predicted Category: <span className="font-semibold">{fp.intensity_category}</span></div>
                <div>Max Sustained Wind: <span className="font-mono">{fp.wind_speed_knots} kts</span> ({Math.round(fp.wind_speed_knots * 1.852)} km/h)</div>
                <div>Central Pressure: <span className="font-mono">{fp.central_pressure_hpa} hPa</span></div>
                <div>Error Radius: <span className="font-mono">±{fp.cone_radius_km} km</span></div>
                <div>Valid: <span className="text-slate-400">{new Date(fp.valid_timestamp).toUTCString()}</span></div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 6. Current Storm Center & Wind Radii */}
        {latestPt && (
          <>
            <Marker
              position={[latestPt.latitude, latestPt.longitude]}
              icon={createVortexIcon('#ef4444')}
            >
              <Popup>
                <div className="p-1.5 text-slate-100 text-xs">
                  <div className="font-extrabold text-rose-400 text-sm mb-1">{cyclone?.name} (CURRENT EYE)</div>
                  <CycloneBadge category={latestPt.intensity_category} className="mb-2" />
                  <div>Current MSW: <span className="font-mono font-bold text-white">{latestPt.wind_speed_knots} kts</span> ({Math.round(latestPt.wind_speed_knots * 1.852)} km/h)</div>
                  <div>Central Pressure: <span className="font-mono font-bold text-white">{latestPt.central_pressure_hpa} hPa</span></div>
                  <div>Movement: <span className="font-mono">{latestPt.movement_speed_kmh} km/h toward {latestPt.movement_direction_deg}°</span></div>
                </div>
              </Popup>
            </Marker>

            {/* Dynamic Gale Wind Radii Buffers */}
            {showWindRadii && (
              <>
                {/* 34-knot gale wind ring (~80-120 nm = ~150-220 km) */}
                <Circle
                  center={[latestPt.latitude, latestPt.longitude]}
                  radius={latestPt.radius_34kt_nm ? latestPt.radius_34kt_nm * 1852 : 180000}
                  pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.08, weight: 1.5 }}
                >
                  <Tooltip sticky>34-knot (Gale) Wind Swath</Tooltip>
                </Circle>

                {/* 50-knot storm wind ring (~45-65 nm = ~80-120 km) */}
                <Circle
                  center={[latestPt.latitude, latestPt.longitude]}
                  radius={latestPt.radius_50kt_nm ? latestPt.radius_50kt_nm * 1852 : 100000}
                  pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.12, weight: 1.5 }}
                >
                  <Tooltip sticky>50-knot (Storm Force) Radius</Tooltip>
                </Circle>

                {/* 64-knot hurricane wind core (~25-35 nm = ~45-65 km) */}
                <Circle
                  center={[latestPt.latitude, latestPt.longitude]}
                  radius={latestPt.radius_64kt_nm ? latestPt.radius_64kt_nm * 1852 : 55000}
                  pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.22, weight: 2 }}
                >
                  <Tooltip sticky>64-knot (Destructive Hurricane Core)</Tooltip>
                </Circle>
              </>
            )}
          </>
        )}

        {/* 7. Coastal Risk / Shelter Markers */}
        {showShelters &&
          coastalZones.map((zone) => {
            const isRed = zone.current_alert_level === 'Red';
            const markerColor = isRed ? '#ef4444' : zone.current_alert_level === 'Orange' ? '#f59e0b' : '#10b981';

            return (
              <Circle
                key={`zone-${zone.id}`}
                center={[zone.latitude, zone.longitude]}
                radius={28000}
                pathOptions={{
                  color: markerColor,
                  fillColor: markerColor,
                  fillOpacity: isRed ? 0.35 : 0.2,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="p-1 text-slate-100 text-xs">
                    <div className="font-bold text-white text-sm mb-1">{zone.district_name}, {zone.state_name}</div>
                    <div>Alert Stage: <span className="font-bold" style={{ color: markerColor }}>{zone.current_alert_level}</span></div>
                    <div>Vulnerability Index: <span className="font-mono">{(zone.vulnerability_index * 100).toFixed(0)}%</span></div>
                    <div>Population at Risk: <span className="font-mono">{zone.population_at_risk.toLocaleString()}</span></div>
                    <div>Shelters Available: <span className="font-mono">{zone.shelter_count}</span> (Cap: {zone.shelter_capacity.toLocaleString()})</div>
                    <div>Status: <span className="font-semibold text-rose-300">{zone.evacuation_status}</span></div>
                  </div>
                </Popup>
              </Circle>
            );
          })}
      </MapContainer>
    </div>
  );
};
