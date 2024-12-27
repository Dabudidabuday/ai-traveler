import type { FC } from 'react';
import { Box, Card, CircularProgress, ImageList, ImageListItem, Typography, Link } from '@mui/material';
import Grid from '@mui/material/Grid2'
import { Place } from '../../App';
import { TripMap } from '../../trip/Map';

interface GoogleMaps {
  place_id?: string;
}

export type Event = {
  name: string;
  date: string;
  time: string;
  locationName: string;
  googleMaps: GoogleMaps;
  sourceLink: string;
  shortDescription: string;
}

export const DataPreview: FC<{ data: (Place | Event)[]; isLoading: boolean }> = ({ data, isLoading }) => {
  const isEventData = (item: Place | Event): item is Event => {
    return 'shortDescription' in item;
  };

  const renderEvents = () => (
    <Grid container spacing={3} sx={{ display: 'flex', textAlign: 'left', marginTop: '30px', marginBottom: '30px'}}>
      {data.filter(isEventData).map(({ name, date, time, locationName, googleMaps, sourceLink, shortDescription }, index) => {
        if(!date || !locationName) return null;

        return (
          <Grid size={3} key={`${name}-${index}`} sx={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <Card sx={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography fontSize={18} sx={{ marginBottom: 1}}>{name}</Typography>
              <Typography><b>Date:</b> {date}</Typography>
              {time && <Typography><b>Time:</b> {time}</Typography>}
              <Typography><b>Location:</b> {locationName}</Typography>
              {shortDescription && <Typography><b>Description:</b> {shortDescription}</Typography>}
              <Box sx={{ display: 'flex', gap: '20px', justifySelf: 'start-end', marginTop: 'auto'}}>
                <Link href={sourceLink} target='_blank' rel="noreferrer">Source</Link>
                <Link href={`https://www.google.com/maps/place/?q=place_id:${googleMaps?.place_id}`} target='_blank' rel="noreferrer">Google Maps</Link>
              </Box>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )

  const isPlaceData = (item: Place | Event): item is Place => {
    return 'workingHours' in item;
  };

  const renderPlaces = () => (
    <Grid container spacing={2} sx={{ display: 'flex', textAlign: 'left', marginTop: '30px'}}>
      {data.filter(isPlaceData).map(({ name, workingHours, atmosphere, advice, images }, index) => (
        <Grid size={4} key={`${name}-${index}`} sx={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <Typography fontSize={20} sx={{ marginBottom: 1}}>{name}</Typography>
          <Typography fontWeight="bold" fontSize={13}><b>Working hours: </b>{workingHours}</Typography>
          <Typography><b>Atmosphere:</b> {atmosphere}</Typography>
          <Typography><b>Advice:</b> {advice}</Typography>
          <ImageList variant="standard" cols={3} gap={1}>
            {images?.map(({ link, title }: { link: string, title: string }) => {
              if (!link.includes('.jpg')) return null;

              return (
                <ImageListItem key={link}>
                  <img
                    srcSet={`${link}`}
                    src={`${link}`}
                    alt={title}
                    loading="lazy"
                  />
                </ImageListItem>
              )
            })}
          </ImageList>
        </Grid>
      ))}
    </Grid>
  )

  if(isLoading) return (<CircularProgress sx={{ marginTop: '30px'}}/>)
  if(!data.length) return <></>
  
  return (
    <>
      {data.some(isEventData) ? renderEvents() : renderPlaces()}
      <TripMap data={data} />
    </>
  ) 
};
