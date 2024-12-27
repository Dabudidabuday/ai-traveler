import './App.css'
import { Box, Typography } from '@mui/material'
import { Form } from './components/Form/Form'
import { api } from './api/api'
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataPreview } from './components/DataPreview/DataPreview';

export interface PlacesRequest {
  message: string;
  country?: string;
  city?: string;
  isWalkingTrip?: boolean;
  tripTheme?: string;
  tripDuration?: string;
  eventType?: string;
  events?: boolean;
}

function App() {
  const [userRequest, set$userRequest] = useState<PlacesRequest>();

  const { isLoading, data = [] } = useQuery({
    queryKey: ['events', userRequest],
    enabled: !!userRequest,
    retry: 1,
    queryFn: async () => {
      if (userRequest?.events) {
        const response = await api.post('/events', userRequest)

        return response?.data;
      }

      const response = await api.post('/message', userRequest)
      return response?.data;
      }
  });

  return (
    <Box sx={{minWidth: '1200px', width: "100%", margin: '0 auto' }}>
      <Typography sx={{mb: 5, fontSize: '24px' }}>Describe your trip</Typography>
      
      <Form getPlaces={set$userRequest}/>

      <DataPreview data={data} isLoading={isLoading} />
    </Box>
  )
}

export default App
