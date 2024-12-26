import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import getImages from '../images';
import { TripRequest } from './messages.types';
import { getLocation } from '../utils/getLocation';

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
    fullAddress: z.string(),
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
        content: `
          You are travel expert. You know what's best to do and when.
          You will help to find exactly right place for current mood, desired atmosphere.
          When asked about places, suggest 2-8 places with specific details from request.

          You have to provide the full address of each place.
          Example of full address: 
          <example-model>
            { fullAddress: "123 Main St, New York, NY 10001" }
            { fullAddress: "Soi Sukhumvit 26, Khlong Tan, Khlong Toei, Bangkok 10110" }
          </example-model>
          
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
              So distance between places should be 1100 meters or less.
              Consider only walking type of transportation available.` 
            : ''}


          ${isWalkingTrip 
            ? `
            Important instructions for walking routes:
            1. Return places in the most efficient walking order
            2. First place should be a good starting point (e.g., near public transport or city center)
            3. Arrange subsequent places to minimize backtracking
            4. Each next place should be within 1100 meters from the previous one
            5. Consider the natural flow of the area (main streets, landmarks, etc.)
            6. Last place should ideally be near public transport or in a convenient location
            7. This places must be as close to each other as possible.
            7. If place is more than 1.5 kilometers away from previous one, do not return it.
            ` : ''}
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
  const imagePromises = places.map((place: Place) => getImages({ place, userRequest: req.body }));
  const requestedImages = await Promise.all(imagePromises);
  const images = await Promise.all(requestedImages.map(response => response.json()))
  const imagesLinks = images.map((data) => data.items);
  const placesWithImages = places.map((place: Place, index: number) => ({
    ...place,
    images: imagesLinks[index]
  }));

  const locations = await Promise.all(placesWithImages.map((place) => getLocation(place.fullAddress)));
  const placesWithLocations = placesWithImages.map((place, index) => ({
    ...place,
    location: locations[index]?.results?.[0]
  }));

  res.send(placesWithLocations);
})
