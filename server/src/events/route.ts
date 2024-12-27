import express, { Request, Response } from 'express';
import { z } from 'zod';
import { scrapeEvents } from '../scraping';
import { getLocation } from '../utils/getLocation';

export const eventsRoute = express.Router();

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
    })
  );
  
export type Event = z.infer<typeof Events>[number];

eventsRoute.post('/events', async (req: Request, res: Response) => {
  try {
    const events = await scrapeEvents(req.body);
    const parsedEvents = Events.parse(events);
    const locations = await Promise.all(parsedEvents.map((event) => getLocation(event.fullAddress)));
    const eventsWithLocations = parsedEvents.map((event: Event, index: number) => ({
      ...event,
      location: locations[index]?.results?.[0] || null
    }));
    res.send(eventsWithLocations);
  } catch (error) {
    console.error('Error in events route', error);
    res.status(500).send('Internal server error');
  }
})
