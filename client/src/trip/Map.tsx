import React, { useEffect, useState } from "react";
import { AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { Place } from "../App";


export const TripMap = ({ data }: { data: Place[] }) => {
  const map = useMap();
  const [routeUrl, set$routeUrl] = useState<string>('');


  useEffect(() => {
    if (!data || !map) return;

    const placesLocations = data.map(({ location, name }) => ({
      key: name, 
      location: { lat: location.latitude, lng: location.longitude}
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
        suppressMarkers: true
      });

      const preparedWaypoints = placesLocations.slice(1, -1).map(place => ({
        location: place.location,
        stopover: true
      }));

      directionsService.route({
        origin: placesLocations[0].location,
        destination: placesLocations[placesLocations.length - 1].location,
        waypoints: preparedWaypoints,
        travelMode: google.maps.TravelMode.WALKING,
        optimizeWaypoints: true
      })
      .then(response => {
        directionsRenderer.setDirections(response);
      })
      .catch(error => console.error('Error calculating route:', error));

      return () => directionsRenderer.setMap(null);
    }
  }, [data, map]);

  return (
    <>
      {data.map(({ location, name }) => (
        <AdvancedMarker
          key={name}
          position={{ lat: location.latitude, lng: location.longitude }}
        >
          <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
      ))}

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
    </>
  );
};
