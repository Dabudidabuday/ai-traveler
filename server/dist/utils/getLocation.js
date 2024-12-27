"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = void 0;
const google_maps_services_js_1 = require("@googlemaps/google-maps-services-js");
const googleMapsClient = new google_maps_services_js_1.Client({});
const getLocation = async (address) => {
    if (!address.length)
        return null;
    const response = await googleMapsClient.geocode({
        params: { address, key: process.env.GOOGLE_MAPS_API_KEY || '' },
    });
    return response.data;
};
exports.getLocation = getLocation;
