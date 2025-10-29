export function calculateDistanceKm(lat1,lon1,lat2,lon2){
  const toRad = v=>v * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
export function calculateSpeedKmH(currentIndex, routeData){
  if(currentIndex === 0 || routeData.length <= 1) return "0.00";
  const curr = routeData[currentIndex];
  const prev = routeData[currentIndex - 1];
  if(!curr || !prev) return "0.00";
  const distanceKm = calculateDistanceKm(prev.lat, prev.lng, curr.lat, curr.lng);
  const dtMs = new Date(curr.timestamp).getTime() - new Date(prev.timestamp).getTime();
  const hours = dtMs / (1000 * 60 * 60);
  if(hours <= 0) return "N/A";
  const speed = distanceKm / hours;
  return speed.toFixed(2);
}
