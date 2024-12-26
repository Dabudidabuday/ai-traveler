import express, { Request, Response } from 'express';
import {Client} from "@googlemaps/google-maps-services-js";
import { z } from 'zod';

import getImages from '../images';
import { scrapeEvents } from '../scraping';
import { getLocation } from '../utils/getLocation';


export const eventsRoute = express.Router();

const googleMapsClient = new Client({});

const Events = 
  z.array(
    z.object({
      name: z.string(),
      shortDescription: z.string(),
      date: z.string(),
      time: z.string(),
      locationName: z.string(),
      fullAddress: z.string(),
      sourceLink: z.string(),
      location: z.object({
        latitude: z.number(),
        longitude: z.number()
      }),
    })
  );
export type Event = z.infer<typeof Events>[number];

eventsRoute.post('/events', async (req: Request, res: Response) => {
  try {
    const events = await scrapeEvents(req.body);
    const parsedEvents = Events.parse(events);
    // const imagePromises = parsedEvents.map((event) => getImages({place: event, userRequest:req.body, count: 1}));
    // const requestedImages = await Promise.all(imagePromises);
    // const images = await Promise.all(requestedImages.map(response => response.json()));
    // const imagesLinks = images.map((data) => data.items);
    // const placesWithImages = parsedEvents.map((event, index) => ({
    //   ...event,
    //   images: imagesLinks[index]
    // }));

    const locations = await Promise.all(parsedEvents.map((event) => getLocation(event.fullAddress)));

    const eventsWithLocations = parsedEvents.map((event: Event, index: number) => ({
      ...event,
      googleMaps: locations[index]?.results?.[0] || null
    }));
    res.send(eventsWithLocations);
  } catch (error) {
    console.error('Error in events route', error);
    res.status(500).send('Internal server error');
  }
})
