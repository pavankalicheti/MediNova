import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon paths in React Vite
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const ambulanceIcon = L.divIcon({
  className: 'custom-ambulance-marker',
  html: `<div style="background-color: #2563eb; color: white; padding: 6px; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid white; box-shadow: 0 0 15px rgba(37,99,235,0.8); animation: pulse 1.5s infinite;">🚑</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const hospitalIcon = L.divIcon({
  className: 'custom-hospital-marker',
  html: `<div style="background-color: #1d4ed8; color: white; padding: 6px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 0 10px rgba(29,78,216,0.6);">🏥</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const patientIcon = L.divIcon({
  className: 'custom-patient-marker',
  html: `<div style="background-color: #0284c7; color: white; padding: 6px; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 0 10px rgba(2,132,199,0.6);">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function MapView({ ambulanceLat, ambulanceLng, patientLat, patientLng, driverName, vehicleNumber, status, progress = 50 }) {
  // Default base coordinates if none passed (NYC Metro Area sample coordinates)
  const baseLat = 40.7128;
  const baseLng = -74.0060;

  const targetLat = patientLat || 40.7484;
  const targetLng = patientLng || -73.9857;

  // Compute simulated interpolated position of moving ambulance along path based on progress %
  const p = Math.min(Math.max(progress, 0), 100) / 100;
  const currentAmbLat = baseLat + (targetLat - baseLat) * p;
  const currentAmbLng = baseLng + (targetLng - baseLng) * p;

  const routePolyline = [
    [baseLat, baseLng],
    [currentAmbLat, currentAmbLng],
    [targetLat, targetLng]
  ];

  const mapCenter = [currentAmbLat, currentAmbLng];

  return (
    <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-blue-200 shadow-md relative z-0">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={mapCenter} />

        {/* Hospital Base Marker */}
        <Marker position={[baseLat, baseLng]} icon={hospitalIcon}>
          <Popup>
            <div className="text-slate-900 font-sans p-1">
              <strong className="block font-bold">MediNova Dispatch Base</strong>
              <span className="text-xs text-slate-600">Central Emergency Response Outpost</span>
            </div>
          </Popup>
        </Marker>

        {/* Patient Pickup Marker */}
        <Marker position={[targetLat, targetLng]} icon={patientIcon}>
          <Popup>
            <div className="text-slate-900 font-sans p-1">
              <strong className="block font-bold">Emergency Pickup Location</strong>
              <span className="text-xs text-slate-600">Patient awaiting transport</span>
            </div>
          </Popup>
        </Marker>

        {/* Live Moving Ambulance Marker */}
        <Marker position={[currentAmbLat, currentAmbLng]} icon={ambulanceIcon}>
          <Popup>
            <div className="text-slate-900 font-sans p-1">
              <strong className="block font-bold text-blue-600">Ambulance {vehicleNumber || 'AMB-9021'}</strong>
              <div className="text-xs text-slate-700">Driver: {driverName || 'Robert Taylor'}</div>
              <div className="text-xs font-semibold text-blue-700 mt-0.5">Status: {status || 'En route'} ({progress}% En route)</div>
            </div>
          </Popup>
        </Marker>

        {/* Simulated Route Polyline */}
        <Polyline
          positions={routePolyline}
          color="#2563eb"
          weight={4}
          opacity={0.7}
          dashArray="8, 8"
        />
      </MapContainer>

      {/* Map Control Live Overlay Bar */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md border border-blue-200 rounded-xl p-3 shadow-lg max-w-xs text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
          <span>Live GPS Simulation</span>
        </div>
        <div className="text-slate-600">Vehicle: <strong className="text-blue-600 font-mono">{vehicleNumber || 'AMB-9021'}</strong></div>
        <div className="text-slate-500 mt-1">Status: <span className="text-blue-700 font-semibold">{status || 'En route'}</span></div>
        {/* Progress Bar */}
        <div className="w-full bg-blue-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
}
