import './App.css'
import { Box, CircularProgress, ImageList, ImageListItem, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2';
import { GoogleMap, Marker, useJsApiLoader, Map } from '@react-google-maps/api';
import { Form } from './components/Form/Form'
import { api } from './api/api'
import { useEffect, useState } from 'react';


export interface PlacesRequest {
  message: string;
  country?: string;
  city?: string;
}


function App() {
  const [data, set$data] = useState([]);
  const [markers, set$markers] = useState([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'xai-RqQB7kdKW01XpKp2K4kHYCvrmIjDzCVGXCGnlvKGACxu5fNxdAdMgoxge2Tela6iq2TVsle1A7GFx314',
  })

  const fetchPossiblePlaces = async ({message, country, city}: PlacesRequest) => {
    const possiblePlaces = await api.post('/message', {message, country, city});

    console.log('possiblePlaces', possiblePlaces);
    set$data(possiblePlaces?.data);
  }

  useEffect(() => {
    if (data?.length) {
      const newMarkers = data.map(({ latitude, longitude, name }) => ({ 
        position: { lat: latitude, lng: longitude } 
      }));
      set$markers(newMarkers);
    }
  }, [data]);

  const onLoad = (map) => {
    if (markers.length) {
      // const bounds = new google.maps.LatLngBounds();
      // markers.forEach(({ position }) => bounds.extend(position));
      // map.fitBounds(bounds);
    }
  };

  // const onLoad = (map: google.maps.Map) => {
  //   const bounds = new google.maps.LatLngBounds();

  //   const markers = data?.map(({ latitude, longitude, name }) => ({ position: { lat: latitude, lng: longitude } }));
  //   set$markers(markers);
  //   markers.forEach(({ position }) => bounds.extend(position));
  //   map.fitBounds(bounds);
  // };

  // console.log('data', data);

  return (
    <Box sx={{width: '1200px', margin: '0 auto' }}>
      <Typography sx={{mb: 5, fontSize: '24px' }}>Tell me what you want to do</Typography>
      <Form getPlaces={fetchPossiblePlaces}/>

      {!data 
        ? <CircularProgress /> 
        : <Grid container spacing={2} sx={{ display: 'flex', textAlign: 'left', marginTop: '30px'}}>
          {data?.map(({ name, workingHours, atmosphere, advice, images }) => (
            <Grid size={4} key={name}>
            <Typography fontSize={20} sx={{ marginBottom: 1}}>{name}</Typography>
            <Typography fontWeight="bold" fontSize={13}>Working hours: {workingHours}</Typography>
            <Typography>Atmosphere: {atmosphere}</Typography>
            <Typography>Advice: {advice}</Typography>
            <ImageList variant="masonry" cols={3} gap={8}>
              {images?.map(({ link, title }) => (
                <ImageListItem key={link}>
                  <img
                    srcSet={`${link}?w=248&fit=crop&auto=format&dpr=2 2x`}
                    src={`${link}?w=248&fit=crop&auto=format`}
                    alt={title}
                    loading="lazy"
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Grid>
        ))}
      </Grid>
      }
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '200px' }}
        // center={center}
        zoom={10}
        // onLoad={onLoad}
        // onUnmount={onUnmount}
      >
       {markers && markers?.map(({ position }) => (
          <Marker position={position} />
        ))}
      </GoogleMap>
    </Box>
  )
}

export default App
