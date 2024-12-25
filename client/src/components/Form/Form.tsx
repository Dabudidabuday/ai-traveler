import React, { useEffect, useState } from 'react';
import { Autocomplete, Button, Checkbox, CircularProgress, FormControlLabel, MenuItem, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PlacesRequest } from '../../App';

interface FormProps {
  getPlaces: (args: PlacesRequest) => void;
}

interface OptionItem {
  id: string;
  value: string;
}

export const Form = ({ getPlaces }: FormProps) => {
  const [citiesList, set$citiesList] = useState([]);
  const [country, set$country] = useState('');
  const [city, set$city] = useState('');

  const { handleSubmit, control, getValues, setValue } = useForm({
    defaultValues: {
      message: '',
      city: '',
      country: '',
      tripDuration: '',
      tripTheme: '',
      walkingTrip: false,
      events: false,
    },
  })

  const { isPending, data: countries } = useQuery({
    queryKey: ['repoData'],
    queryFn: async () => {
      const response = await axios.get(
        'https://restcountries.com/v3.1/all',
      )

      return await response.data.map(({ name: { common }, ccn3 }: { name: { common: string }, ccn3: string }) => ({id: ccn3, value: common})).sort((a: OptionItem, b: OptionItem) => a.value.localeCompare(b.value))
    },
  })

  const { data: fetchedCities = [], isPending: isCitiesPending, isLoading: isCitiesLoading } = useQuery({
    queryKey: ['getCities'],
    enabled: country.length > 0,
    queryFn: async () => {
      const response = await axios.post(
        'https://countriesnow.space/api/v0.1/countries/cities',
        {
          country: country,
        }
      )

      const formattedCities = await response.data.data
        .map((city: string) => ({id: city, value: city}))
        .sort((a: OptionItem, b: OptionItem) => a.value.localeCompare(b.value));

      set$citiesList(formattedCities);

      return formattedCities;
    },
  });

  useEffect(() => {
    if(country == '') {
      set$citiesList([]);
      setValue('city', '');
    }
  }, [country, setValue]);

  const onSubmit = async () => {
    const message = getValues('message');
    const tripDuration = getValues('tripDuration');
    const tripTheme = getValues('tripTheme');
    const isWalkingTrip = getValues('walkingTrip');
    const events = getValues('events');

    getPlaces({ message, country, city, tripDuration, tripTheme, isWalkingTrip, events });
    setValue('message', '');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container sx={{ display: 'flex', gap: '20px', }}>
    
      <Grid size={2}>
        {isPending ? <CircularProgress /> : (
          <Controller
          name="country"
          control={control}
          render={({ field, ...props }) => (
            <Autocomplete 
              {...props}
              options={countries}
              disablePortal
              autoHighlight
              onChange={(_, data: { value: string } | null) => {
                field.onChange(data?.value || '')
                set$country(data?.value || '');
              }}
              getOptionLabel={(option) => {
                return option.value?.length ? String(option.value): ''
              }}
              renderOption={(props, option: { value: string}) => {
                const { key, ...optionProps } = props;
                return (
                  <MenuItem
                    key={key}
                    value={option.value}
                    {...optionProps}
                  >

                    {option.value}
                  </MenuItem>
                );
              }}
              renderInput={
                (params) => 
                  <TextField 
                    {...params}
                    label="Country"
                  />
              }
            />
        )}
        />
        )}
      </Grid>


      <Grid size={2}>
        {isCitiesLoading && country ? <CircularProgress /> : (
          <Controller
          name="city"
          control={control}
          render={({ field, ...props }) => (
            <Autocomplete 
              {...props}
              options={citiesList}
              disablePortal
              autoHighlight
              onChange={(_, data: { value: string } | null) => {
                field.onChange(data?.value || '')
                set$city(data?.value || '')
              }}
              getOptionLabel={(option) => {
                return option.value?.length ? String(option.value): ''
              }}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <MenuItem
                    key={key}
                    value={option.value}
                    {...optionProps}
                  >

                    {option.value}
                  </MenuItem>
                );
              }}
              renderInput={
                (params) => 
                  <TextField 
                    {...params}
                    label="City"
                  />
              }
            />
        )}
        />
        )}
      </Grid>

      <Grid size={2}>
        <Controller
          name="tripDuration"
          control={control}
          render={({ field }) => <TextField label="Trip duration" sx={{width: '100%'}} {...field}  />}
          />
      </Grid>

      <Grid size={2}>
        <Controller
          name="tripTheme"
          control={control}
          render={({ field }) => <TextField label="Main theme" sx={{width: '100%'}} {...field}  />}
          />
      </Grid>

      <Grid size={2}>
        <Controller
          name="events"
          control={control}
          render={({ field }) =><FormControlLabel label="Show events" control={<Checkbox {...field} />} />}
          />
      </Grid>

      
      <Grid size={1}>
        <Controller
          name="walkingTrip"
          control={control}
          render={({ field }) => <FormControlLabel label="Walking?" control={<Checkbox {...field} />} />}
          />
      </Grid>

      <Grid size={12} sx={{display: 'flex', gap: '20px'}}>
        <Controller
          name="message"
          control={control}
          render={({ field }) => <TextField sx={{width: '100%'}} {...field}  />}
          />
        <Button type='submit' variant='contained'>Submit</Button>
      </Grid>
    </Grid>
    </form>
  )
}
