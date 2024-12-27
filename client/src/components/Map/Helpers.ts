export const computeTotalDistance = (result: google.maps.DirectionsResult | null) => {
  if (!result) return 0;

  let total = 0;
  const myroute = result.routes[0];

  if (!myroute) {
    return;
  }

  for (let i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i]!.distance!.value;
  }

  return total / 1000;
}
