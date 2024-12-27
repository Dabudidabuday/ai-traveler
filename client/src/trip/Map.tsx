import type { FC } from 'react';
import { useEffect, useRef, useState } from "react";
import { useMap, Map } from "@vis.gl/react-google-maps";
import { Typography } from "@mui/material";

import { computeTotalDistance } from "./Helpers";

interface Location {
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  }
}

interface Place {
  location: Location;
  name: string;
  description: string;
  
}

export const TripMap: FC<{ data: Place[] }> = ({ data }) => {
  const map = useMap();
  const [routeUrl, set$routeUrl] = useState<string>('');
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const mapRenderer = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!data || !map) return;

    const placesLocations: { key: string; location: { lat: number; lng: number } }[] = data.map(({ location, name }, index: number) => ({
      key: `${name}-${index}`, 
      location: location?.geometry?.location
    }));

    if (placesLocations.length > 1) {
      const origin = `${placesLocations[0].location.lat},${placesLocations[0].location.lng}`;
      const destination = `${placesLocations[placesLocations.length - 1].location.lat},${placesLocations[placesLocations.length - 1].location.lng}`;
      const waypoints = placesLocations
        .slice(1, -1)
        .map(place => `${place.location.lat},${place.location.lng}`)
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
        origin: { lat: placesLocations[0].location.lat, lng: placesLocations[0].location.lng },
        destination: { lat: placesLocations[placesLocations.length - 1].location.lat, lng: placesLocations[placesLocations.length - 1].location.lng },
        waypoints: preparedWaypoints,
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
    {totalDistance && <Typography variant="subtitle1" sx={{fontWeight: 'bold', mb: 1, textAlign: 'left'}}>
      Total Distance: {totalDistance} km
    </Typography>}
    <Map
      defaultZoom={5}
      defaultCenter={{ lat: 20, lng: 1 }}
      mapId="7623ed04bbcb3bc9"
      style={{width: '100%', height: '400px'}}
    >

      {routeUrl && (
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px', 
          backgroundColor: 'white', 
          padding: '10px', 
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <a 
            href={routeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none',
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Save Route</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
            </svg>
          </a>
        </div>
      )}
    </Map>
    </>
  );
};
