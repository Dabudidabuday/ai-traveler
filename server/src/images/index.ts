import fetch from 'node-fetch';
import { Place } from '../messages/route';


// const AI_TRAVELER_GOOGLE_SEARCH_API_KEY = 'AIzaSyCxmCBV22NXikIup5hL1D3bay8AT3gxs7w';
const API_KEY = 'AIzaSyAksBNyqCtkZaSefp2pZ10jhDQw6chPMKU';
const CX_ID = '83884d2e3726649dd'

const getImages = async ({ place, userRequest , count}: { place: any, userRequest: any, count?: number }) => {
    // const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&count=${count || 8}&fileType=jpg,png&searchType=image&q=${place?.locationName} ${place?.name} ${place?.placeType ?  place.placeType + 'exterior interior' : ''} photos. Location: ${userRequest.city}, ${userRequest.country}`, {
//     method: 'GET',
//   });

   const response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${place.name}+in+${place?.locationName || ''}+exterior+OR+interior+${userRequest?.country || ''}+${userRequest?.city || ''}&searchType=image&count=${count || 3}&cx=${CX_ID}&key=${API_KEY}&lr=lang_th&safe=active`, {
    method: 'GET',
  });

  return response;
}

export default getImages;
