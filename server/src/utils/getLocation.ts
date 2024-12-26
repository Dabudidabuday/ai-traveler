import { Client } from "@googlemaps/google-maps-services-js";

const googleMapsClient = new Client({});

export const getLocation = async (address: string) => {
  const response = await googleMapsClient.geocode({
    params: { address, key: process.env.GOOGLE_MAPS_API_KEY || '' },
  });
  return response.data;
};
