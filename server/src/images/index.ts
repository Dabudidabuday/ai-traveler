import fetch from 'node-fetch';


const API_KEY = 'AIzaSyAksBNyqCtkZaSefp2pZ10jhDQw6chPMKU';
const CX_ID = '83884d2e3726649dd'

const getImages = async (place: string) => {
  const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyAksBNyqCtkZaSefp2pZ10jhDQw6chPMKU&cx=83884d2e3726649dd&count=8&searchType=image&q=${place}`, {
    method: 'GET',
  });

  return response;
}

export default getImages;
