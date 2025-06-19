export function getBoundingBoxFromRows(data: { latitude: number; longitude: number }[]) {
  let latMin = Infinity, latMax = -Infinity;
  let longMin = Infinity, longMax = -Infinity;

  for (const point of data) {
    latMin = Math.min(latMin, point.latitude);
    latMax = Math.max(latMax, point.latitude);
    longMin = Math.min(longMin, point.longitude);
    longMax = Math.max(longMax, point.longitude);
  }

  return { latMin, latMax, longMin, longMax };
}
