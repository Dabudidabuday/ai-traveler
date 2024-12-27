"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsRoute = void 0;
const express_1 = __importDefault(require("express"));
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const zod_1 = require("zod");
const scraping_1 = require("../scraping");
const getLocation_1 = require("../utils/getLocation");
exports.eventsRoute = express_1.default.Router();
const googleMapsClient = new google_maps_services_js_1.Client({});
const Events = zod_1.z.array(zod_1.z.object({
    name: zod_1.z.string(),
    shortDescription: zod_1.z.string(),
    date: zod_1.z.string(),
    time: zod_1.z.string(),
    locationName: zod_1.z.string(),
    fullAddress: zod_1.z.string(),
    sourceLink: zod_1.z.string(),
    location: zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number()
    }),
}));
exports.eventsRoute.post('/events', async (req, res) => {
    try {
        const events = await (0, scraping_1.scrapeEvents)(req.body);
        const parsedEvents = Events.parse(events);
        // const imagePromises = parsedEvents.map((event) => getImages({place: event, userRequest:req.body, count: 1}));
        // const requestedImages = await Promise.all(imagePromises);
        // const images = await Promise.all(requestedImages.map(response => response.json()));
        // const imagesLinks = images.map((data) => data.items);
        // const placesWithImages = parsedEvents.map((event, index) => ({
        //   ...event,
        //   images: imagesLinks[index]
        // }));
        const locations = await Promise.all(parsedEvents.map((event) => (0, getLocation_1.getLocation)(event.fullAddress)));
        const eventsWithLocations = parsedEvents.map((event, index) => ({
            ...event,
            googleMaps: locations[index]?.results?.[0] || null
        }));
        res.send(eventsWithLocations);
    }
    catch (error) {
        console.error('Error in events route', error);
        res.status(500).send('Internal server error');
    }
});
