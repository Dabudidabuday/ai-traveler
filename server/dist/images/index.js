"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
// const AI_TRAVELER_GOOGLE_SEARCH_API_KEY = 'AIzaSyCxmCBV22NXikIup5hL1D3bay8AT3gxs7w';
const API_KEY = 'AIzaSyAksBNyqCtkZaSefp2pZ10jhDQw6chPMKU';
const CX_ID = '83884d2e3726649dd';
const getImages = async ({ place, userRequest, count }) => {
    // const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&count=${count || 8}&fileType=jpg,png&searchType=image&q=${place?.locationName} ${place?.name} ${place?.placeType ?  place.placeType + 'exterior interior' : ''} photos. Location: ${userRequest.city}, ${userRequest.country}`, {
    //     method: 'GET',
    //   });
    const response = await (0, node_fetch_1.default)(`https://www.googleapis.com/customsearch/v1?q=${place.name}+in+${place?.locationName || ''}+exterior+OR+interior+${userRequest?.country || ''}+${userRequest?.city || ''}&searchType=image&count=${count || 8}&cx=${CX_ID}&key=${API_KEY}&lr=lang_th&safe=active`, {
        method: 'GET',
    });
    return response;
};
exports.default = getImages;
