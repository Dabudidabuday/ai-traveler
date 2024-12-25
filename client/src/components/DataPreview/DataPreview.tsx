import React from 'react';
import { CircularProgress, ImageList, ImageListItem, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2'
import { Place } from '../../App';
import { TripMap } from '../../trip/Map';

export const DataPreview = ({ data, isLoading }: { data: Place[], isLoading: boolean }) => {
  const renderEvents = () => (
    <Grid container spacing={3} sx={{ display: 'flex', textAlign: 'left', marginTop: '30px'}}>
        {data?.map(({ name, date, time, locationName, googleMapsLocation, sourceLink }, index: number) => (
          <Grid size={3} key={`${name}-${index}`} sx={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <Typography fontSize={20} sx={{ marginBottom: 1}}>{name}</Typography>
            <Typography><b>Date:</b> {date}</Typography>
            <Typography><b>Time:</b> {time}</Typography>
            <Typography><b>Location:</b> {locationName}</Typography>
            <Typography><a href={sourceLink} target='_blank'><b>Source</b></a></Typography>
            <Typography><a href={googleMapsLocation} target='_blank'><b>Location</b></a></Typography>
          </Grid>
        ))}
    </Grid>
  )

  const renderPlaces = () => (
    <Grid container spacing={2} sx={{ display: 'flex', textAlign: 'left', marginTop: '30px'}}>
      {data?.map(({ name, workingHours, atmosphere, advice, images }: Place, index: number) => (
        <Grid size={4} key={`${name}-${index}`} sx={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
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
    </Grid>
  )

  if(isLoading) return (<CircularProgress />)
  if(!data.length) return <></>
  
  return (
    <>
      {data?.[0]?.shortDescription ? renderEvents() : renderPlaces()}
      <TripMap data={data} />
    </>
  ) 
};
