export interface GoogleMaps {
  place_id?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    }
  }
}

export interface Event {
  name: string;
  date: string;
  time: string;
  locationName: string;
  location?: GoogleMaps;
  sourceLink: string;
  shortDescription: string;
}
