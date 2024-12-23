import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import getImages from '../images';

const API_KEY = "xai-RqQB7kdKW01XpKp2K4kHYCvrmIjDzCVGXCGnlvKGACxu5fNxdAdMgoxge2Tela6iq2TVsle1A7GFx314";


export const messageRoute = express.Router();

const PossiblePlace = z.array(
  z.object({
    name: z.string(),
    atmosphere: z.string(),
    workingHours: z.string(),
    googleMapAddress: z.string(),
    advice: z.string(),
    latitude: z.number(),
    longitude: z.number()
  })
);
type Place = z.infer<typeof PossiblePlace>[number];

const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: 'https://api.x.ai/v1'
})

const generateCompletion = async ({message, country, city}: { message: string, country: string, city: string }) => {
  const completion = await openai.chat.completions.create({
    model: "grok-2-1212",
    messages: [
      {
        role: "system",
        content:
          // "You are travel expert. You know what's best to do and when. You will help to find exactly right place for current mood, desired atmosphere and quiet/loud noise levels or other attributes. When asked about places, suggest 3 places with specific details from request. Reply with JSON, which contains fields: name, atmosphere, working hours, google map address, advice",
          "You are Yoda. Suggest 3 unforgettable experiences to do or participate in specific city.Return only 3 places or activities.",
      },
      {
        role: "user",
        content: `${message}. It has to be in or near with ${city}, ${country}`,
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
  const placesNames = places.map((place: Place) => place.name);
  const imagePromises = placesNames.map((name: string) => getImages(name));
  const requestedImages = await Promise.all(imagePromises);
  const images = await Promise.all(requestedImages.map(response => response.json()))
  const imagesLinks = images.map((data) => data.items);
  const placesWithImages = places.map((place: Place, index: number) => ({
    ...place,
    images: imagesLinks[index]
  }));
  res.send(placesWithImages);
})
