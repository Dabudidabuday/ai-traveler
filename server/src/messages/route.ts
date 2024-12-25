import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import getImages from '../images';
import { TripRequest } from './messages.types';

const API_KEY = "xai-RqQB7kdKW01XpKp2K4kHYCvrmIjDzCVGXCGnlvKGACxu5fNxdAdMgoxge2Tela6iq2TVsle1A7GFx314";


export const messageRoute = express.Router();

const PossiblePlace = z.array(
  z.object({
    name: z.string(),
    atmosphere: z.string(),
    workingHours: z.string(),
    googleMapAddress: z.string(),
    advice: z.string(),
    locationName: z.string(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number()
    }),
    placeType: z.string()
  })
);
export type Place = z.infer<typeof PossiblePlace>[number];

const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: 'https://api.x.ai/v1'
})

const generateCompletion = async ({message, country, city, tripDuration, tripTheme, isWalkingTrip}: TripRequest) => {
  const completion = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [
      {
        role: "system",
        content:
          `
          You are travel expert. You know what's best to do and when.
          You will help to find exactly right place for current mood, desired atmosphere.
          When asked about places, suggest 3-6 places with specific details from request.
          `,
      },
      {
        role: "user",
        content: `
          ${message}.
          It has to be in or near with ${city}, ${country}
          ${isWalkingTrip 
            ? `
              It has to be walking trip.
              So distance between places should be 1300 meters or less.
              Return placer in order by most efficient way to walk from first to the last place.` 
            : ''}
          ${tripTheme ? `Each place has to be related to ${tripTheme} theme.` : ''}
          ${tripDuration ? `It has to be for ${tripDuration} duration in total time, that I will spend on trip, cosider time for getting/moving between places.` : ''}
          `,
      },
    ],
    response_format: zodResponseFormat(PossiblePlace, 'event'), 
    temperature: 0.5
  });

  return completion.choices[0].message.content;
};

messageRoute.post('/message', async (req: Request, res: Response) => {
  const message = await generateCompletion(req.body);
  const places = PossiblePlace.parse(JSON.parse(String(message)));
  const imagePromises = places.map((place: Place) => getImages({place, userRequest:req.body}));
  const requestedImages = await Promise.all(imagePromises);
  const images = await Promise.all(requestedImages.map(response => response.json()))
  const imagesLinks = images.map((data) => data.items);
  const placesWithImages = places.map((place: Place, index: number) => ({
    ...place,
    images: imagesLinks[index]
  }));
  res.send(placesWithImages);
})
