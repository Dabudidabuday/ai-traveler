import './App.css'
import { Box, CircularProgress, ImageList, ImageListItem, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2';
import { APIProvider, Map } from '@vis.gl/react-google-maps'
import { Form } from './components/Form/Form'
import { api } from './api/api'
import { useState } from 'react';
import { TripMap } from './trip/Map';

export interface Place {
  name: string;
  workingHours: string;
  atmosphere: string;
  advice: string;
  images: { link: string, title: string }[];
  location: {
    latitude: number;
    longitude: number;
  }
}


export interface PlacesRequest {
  message: string;
  country?: string;
  city?: string;
  isWalkingTrip?: boolean;
  tripTheme?: string;
  tripDuration?: string;
  eventType?: string;
}

function App() {
  const [data, set$data] = useState([]);
  // const map = useMap();


  const fetchPossiblePlaces = async ({message, country, city, tripDuration, tripTheme, isWalkingTrip}: PlacesRequest) => {
    const possiblePlaces = await api.post('/message', {message, country, city, tripDuration, tripTheme, isWalkingTrip});
    set$data(possiblePlaces?.data);
  }

  // useEffect(() => {

  //   if(!data) return null;

  //   const placesLocations = data.map(({ location, name }: Place) => ({
  //     key: name, 
  //     location: { lat: location.latitude, lng: location.longitude}
  //   }));

  //   if (placesLocations.length > 1 && map) {
  //     const directionsService = new google.maps.DirectionsService();
  //     const directionsRenderer = new google.maps.DirectionsRenderer({
  //       map,
  //       suppressMarkers: true // We'll keep our custom markers
  //     });

  //     const waypoints = placesLocations.slice(1, -1).map(place => ({
  //       location: place.location,
  //       stopover: true
  //     }));

  //     const buildRoute = async () => {
  //       return await directionsService.route({
  //         origin: placesLocations[0].location,
  //         destination: placesLocations[placesLocations.length - 1].location,
  //         waypoints,
  //         travelMode: google.maps.TravelMode.WALKING,
  //         optimizeWaypoints: true
  //       })
  //       .then(response => {
  //         directionsRenderer.setDirections(response);
  //       })
  //       .catch(error => console.error('Error calculating route:', error));
  //     }
  //     buildRoute();

  //     console.log('buildRoute', buildRoute);

  //     return () => directionsRenderer.setMap(null);
  //   }
  // }, [data, map]);

  return (
    <Box sx={{width: '1200px', margin: '0 auto' }}>
      <Typography sx={{mb: 5, fontSize: '24px' }}>Describe your trip</Typography>
      <Form getPlaces={fetchPossiblePlaces}/>

      {!data 
        ? <CircularProgress /> 
        : <Grid container spacing={2} sx={{ display: 'flex', textAlign: 'left', marginTop: '30px'}}>
          {data?.map(({ name, workingHours, atmosphere, advice, images }: Place) => (
            <Grid size={4} key={name} sx={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <Typography fontSize={20} sx={{ marginBottom: 1}}>{name}</Typography>
            <Typography fontWeight="bold" fontSize={13}><b>Working hours:</b>{workingHours}</Typography>
            <Typography><b>Atmosphere:</b> {atmosphere}</Typography>
            <Typography><b>Advice:</b> {advice}</Typography>
            <ImageList variant="masonry" cols={3} gap={8}>
              {images?.map(({ link, title }: { link: string, title: string }) => (
                <ImageListItem key={link}>
                  <img
                    srcSet={`${link}`}
                    src={`${link}`}
                    alt={title}
                    loading="lazy"
                  />
                </ImageListItem>
              ))}
            </ImageList>


          </Grid>
        ))}

          <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} onLoad={() => console.log('Maps API has loaded.')}>
            <Map
              defaultZoom={5}
              // zoom={12}
              // center={{ lat: 20, lng: 1 }}
              // defaultCenter={{ lat: 20, lng: 1 }}
              mapId={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              style={{width: '100%', height: '400px'}}
            >
              <TripMap data={data} />
            </Map>
          </APIProvider>
      </Grid>
      }
    </Box>
  )
}

export default App
