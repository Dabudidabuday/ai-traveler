import React, { useState } from 'react';
import { Autocomplete, Box, Button, MenuItem, TextField } from '@mui/material';
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
  const [country, set$country] = useState('');
  const [city, set$city] = useState('');

  const { handleSubmit, control, getValues, setValue, errors } = useForm({
    defaultValues: {
      message: '',
      city: '',
      country: '',
    },
  })

  const { isPending, data: countries } = useQuery({
    queryKey: ['repoData'],
    queryFn: async () => {
      const response = await axios.get(
        'https://restcountries.com/v3.1/all',
      )

      return await response.data.map(({ name: { common }, ccn3 }) => ({id: ccn3, value: common})).sort((a, b) => a.value.localeCompare(b.value))
    },
  })

  console.log('country', country);
  console.log('city', city);

  const { data: citiesList = [] } = useQuery({
    queryKey: ['getCities'],
    enabled: country.length > 0,
    queryFn: async () => {
      const response = await axios.post(
        'https://countriesnow.space/api/v0.1/countries/cities',
        {
          country: country,
        }
      )

      return await response.data.data
        .map((city: string) => ({id: city, value: city}))
        .sort((a: OptionItem, b: OptionItem) => a.value.localeCompare(b.value));
    },
  });

  const onSubmit = async () => {
    const message = getValues('message');

    getPlaces({ message, country, city });
    setValue('message', '');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', gap: '20px', }}>

      {!isPending && (
        <Controller
        name="country"
        control={control}
        render={({ field, ...props }) => (
          <Autocomplete 
            {...props}
            options={countries}
            disablePortal
            autoHighlight
            onChange={(e, data: { value: string}) => {
              field.onChange(data?.value || '')
              // setValue('country', data.value)
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
                  sx={{minWidth: '250px'}}
                />
            }
          />
      )}
      />
      )}

      {citiesList && (
        <Controller
        name="city"
        control={control}
        render={({ field, ...props }) => (
          <Autocomplete 
            {...props}
            options={citiesList}
            disablePortal
            autoHighlight
            onChange={(e, data: { value: string}) => {
              field.onChange(data?.value || '')
              // setValue('city', data.value)
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
                  sx={{minWidth: '220px'}}
                />
            }
          />
      )}
      />
      )}
        <Controller
          name="message"
          control={control}
          render={({ field }) => <TextField sx={{width: '100%'}} {...field}  />}
        />
        <Button type='submit' variant='contained'>Submit</Button>
      </Box>
    </form>
  )
}
