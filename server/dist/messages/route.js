"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoute = void 0;
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const zod_1 = require("openai/helpers/zod");
const zod_2 = require("zod");
const images_1 = __importDefault(require("../images"));
const getLocation_1 = require("../utils/getLocation");
const API_KEY = "xai-RqQB7kdKW01XpKp2K4kHYCvrmIjDzCVGXCGnlvKGACxu5fNxdAdMgoxge2Tela6iq2TVsle1A7GFx314";
exports.messageRoute = express_1.default.Router();
const PossiblePlace = zod_2.z.array(zod_2.z.object({
    name: zod_2.z.string(),
    atmosphere: zod_2.z.string(),
    workingHours: zod_2.z.string(),
    googleMapAddress: zod_2.z.string(),
    advice: zod_2.z.string(),
    locationName: zod_2.z.string(),
    fullAddress: zod_2.z.string(),
    location: zod_2.z.object({
        latitude: zod_2.z.number(),
        longitude: zod_2.z.number()
    }),
    placeType: zod_2.z.string()
}));
const openai = new openai_1.default({
    apiKey: API_KEY,
    baseURL: 'https://api.x.ai/v1'
});
const generateCompletion = async ({ message, country, city, tripDuration, tripTheme, isWalkingTrip }) => {
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
        response_format: (0, zod_1.zodResponseFormat)(PossiblePlace, 'event'),
        temperature: 0.5
    });
    return completion.choices[0].message.content;
};
exports.messageRoute.post('/message', async (req, res) => {
    const message = await generateCompletion(req.body);
    const places = PossiblePlace.parse(JSON.parse(String(message)));
    const imagePromises = places.map((place) => (0, images_1.default)({ place, userRequest: req.body }));
    const requestedImages = await Promise.all(imagePromises);
    const images = await Promise.all(requestedImages.map(response => response.json()));
    const imagesLinks = images.map((data) => data.items);
    const placesWithImages = places.map((place, index) => ({
        ...place,
        images: imagesLinks[index]
    }));
    const locations = await Promise.all(placesWithImages.map((place) => (0, getLocation_1.getLocation)(place.fullAddress)));
    const placesWithLocations = placesWithImages.map((place, index) => ({
        ...place,
        location: locations[index]?.results?.[0]
    }));
    res.send(placesWithLocations);
});
