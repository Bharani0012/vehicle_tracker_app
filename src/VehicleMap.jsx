import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import AnimatedMarker from "./AnimatedMarker";
import { calculateSpeedKmH } from "./utils";
import "leaflet/dist/leaflet.css";
  
const vehicleIcon = L.divIcon({
  className: "",
  html: '<span style="font-size:20px">🚗</span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

function MapPanTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.panTo(position, { animate: true, duration: 0.8 });
    }
  }, [position, map]);
  return null;
}

export default function VehicleMap() {
  const [routeData, setRouteData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch("/dummy-route.json")
      .then(r => r.json())
      .then(d => {
        if (!mounted) return;
        const transformed = d.map(p => ({
          lat: p.latitude,
          lng: p.longitude,
          timestamp: p.timestamp
        }));
        setRouteData(transformed);
        setCurrentIndex(0);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isPlaying && routeData.length > 1 && currentIndex < routeData.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= routeData.length - 1) {
            clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, routeData, currentIndex]);

  const togglePlay = () => {
    if (currentIndex >= routeData.length - 1) setCurrentIndex(0);
    setIsPlaying(p => !p);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const currentPosition = routeData[currentIndex] || null;
  const fullRouteCoords = routeData.map(p => [p.lat, p.lng]);
  const traveledCoords = routeData.slice(0, currentIndex + 1).map(p => [p.lat, p.lng]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-6 right-6 z-50 w-80 bg-white/90 backdrop-blur-md shadow-lg rounded-2xl border border-gray-200 p-5">
        <div className="text-gray-800 font-semibold text-sm mb-3 border-b border-gray-200 pb-2 flex items-center justify-between">
          <span>🚘 Vehicle Status</span>
          <span className="text-xs text-gray-500">
            {isPlaying ? "Live" : "Paused"}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium">Coordinate:</span>
            <span className="font-mono text-gray-600">
              {currentPosition
                ? `${currentPosition.lat.toFixed(6)}, ${currentPosition.lng.toFixed(6)}`
                : "N/A"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Timestamp:</span>
            <span className="text-gray-600">
              {currentPosition
                ? new Date(currentPosition.timestamp).toLocaleString()
                : "N/A"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Speed:</span>
            <span className="text-gray-600">
              {calculateSpeedKmH(currentIndex, routeData)} km/h
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={togglePlay}
            className={`flex-1 px-3 py-2 rounded-md text-white font-semibold transition-colors ${
              isPlaying
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={resetSimulation}
            className="flex-1 px-3 py-2 rounded-md text-white font-semibold bg-gray-500 hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <MapContainer
        center={[17.385044, 78.486671]}
        zoom={20}
        className="w-full h-screen z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {routeData.length > 0 && (
          <>
            <Polyline positions={fullRouteCoords} color="gray"/>
            <Polyline positions={traveledCoords} color="blue" weight={5} />
          </>
        )}
        {currentPosition && (
          <>
            <MapPanTo position={currentPosition} />
            <AnimatedMarker position={currentPosition} icon={vehicleIcon} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
