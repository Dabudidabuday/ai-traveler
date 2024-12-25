import fetch from 'node-fetch';
import { Place } from '../messages/route';


const API_KEY = 'AIzaSyAksBNyqCtkZaSefp2pZ10jhDQw6chPMKU';
const CX_ID = '83884d2e3726649dd'

const getImages = async ({ place, userRequest  }: { place: Place, userRequest: any }) => {
  const response = await fetch(`
    https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&count=8&fileType=jpg,png&searchType=image&q=${place.name} ${place.placeType} protos interior exterior. location: ${userRequest.city}, ${userRequest.country}`, {
    method: 'GET',
  });

  return response;
}

export default getImages;
