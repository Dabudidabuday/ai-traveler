import type { FC } from 'react';
import { useEffect, useRef, useState } from "react";
import { useMap, Map } from "@vis.gl/react-google-maps";
import { Typography } from "@mui/material";
import { computeTotalDistance } from './Helpers';
import { Place } from '../../types';
import { PlaceLocation } from './Map.types';
import { Event } from '../../components/DataPreview/DataPreview.types';
import { SaveRoute } from './components/SaveRoute';

export const TripMap: FC<{ data: (Place | Event)[] }> = ({ data }) => {
  const map = useMap();
  const [routeUrl, set$routeUrl] = useState<string>('');
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const mapRenderer = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!data || !map) return;

    const placesLocations: PlaceLocation[] = data
      .filter(place => !!place.location?.geometry?.location)
      .map(({ name, location }: Place | Event, index: number) =>  (
          {
            key: `${name}-${index}`, 
            location: location?.geometry?.location
          }
        )
      );

    console.log('placesLocations', placesLocations);

    if (placesLocations.length > 1) {
      const origin = `${placesLocations[0].location?.lat},${placesLocations[0].location?.lng}`;
      const destination = `${placesLocations[placesLocations.length - 1].location?.lat},${placesLocations[placesLocations.length - 1].location?.lng}`;
      const waypoints = placesLocations
        .slice(1, -1)
        .map(place => `${place.location?.lat},${place.location?.lng}`)
        .join('|');
      
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=walking`;
      set$routeUrl(url);
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map,
        draggable: true,
      });

      mapRenderer.current = directionsRenderer;

      const preparedWaypoints = placesLocations.slice(1, -1).map(place => ({
        location: place.location,
        stopover: true
      }));

      directionsService.route({
        origin: placesLocations[0].location || { lat: 0, lng: 0 },
        destination: placesLocations[placesLocations.length - 1].location || { lat: 0, lng: 0 },
        waypoints: preparedWaypoints.map(wp => ({
          location: wp.location || { lat: 0, lng: 0 },
          stopover: wp.stopover
        })),
        travelMode: google.maps.TravelMode.WALKING,
        optimizeWaypoints: true
      })
      .then(response => {
        directionsRenderer.setDirections(response);
      })
      .catch(error => console.error('Error calculating route:', error));


      directionsRenderer.addListener('directions_changed', () => {
        const directions = directionsRenderer.getDirections();
        const totalDistance = computeTotalDistance(directions);
        setTotalDistance(totalDistance || 0);
      });

      return () => directionsRenderer.setMap(null);
    }
  }, [data, map]);

  useEffect(() => {
    if (!mapRenderer.current) return;
    const directions = mapRenderer.current.getDirections();
    const route = directions?.routes[0];
    const origin = `${route?.legs[0]?.start_location.lat()},${route?.legs[0]?.start_location.lng()}`;
    const destination = `${route?.legs[route.legs.length-1]?.end_location.lat()},${route?.legs[route.legs.length-1]?.end_location.lng()}`;
    const waypoints = route?.legs.slice(0, -1).map(leg => 
      `${leg.end_location.lat()},${leg.end_location.lng()}`
    ).join('|');
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=walking`;
    set$routeUrl(url);
  }, [totalDistance]);

  return (
    <>
      {totalDistance && 
        <Typography variant="subtitle1" sx={{fontWeight: 'bold', mb: 1, textAlign: 'left'}}>
          Total Distance: {totalDistance} km
        </Typography>
      }

      <Map
        defaultZoom={5}
        defaultCenter={{ lat: 20, lng: 1 }}
        mapId="7623ed04bbcb3bc9"
        style={{width: '100%', height: '400px'}}
      >
        <SaveRoute routeUrl={routeUrl} />
      </Map>
    </>
  );
};
