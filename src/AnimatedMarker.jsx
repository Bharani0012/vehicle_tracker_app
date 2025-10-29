import React, { useEffect, useRef } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";

export default function AnimatedMarker({ position, icon, duration = 2000 }){
  const markerRef = useRef(null);
  const map = useMap();
  useEffect(()=>{
    const marker = markerRef.current;
    if(!marker || !position) return;
    const start = marker.getLatLng();
    const end = L.latLng(position);
    if(!start || (start.lat === 0 && start.lng === 0)){
      marker.setLatLng(end);
      map.panTo(end, { animate: true, duration: 0.8 });
      return;
    }
    const startTime = performance.now();
    const animate = (now)=>{
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const lat = start.lat + (end.lat - start.lat) * t;
      const lng = start.lng + (end.lng - start.lng) * t;
      marker.setLatLng([lat,lng]);
      if(t < 1){
        requestAnimationFrame(animate);
      } else {
        marker.setLatLng(end);
      }
    };
    requestAnimationFrame(animate);
    map.panTo(end, { animate: true, duration: 0.8 });
  },[position,duration,map]);
  return <Marker ref={markerRef} position={position} icon={icon} />;
}
