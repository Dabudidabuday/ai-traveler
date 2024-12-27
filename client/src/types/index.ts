import { GoogleMaps } from "../components/DataPreview/DataPreview.types";

export interface Location {
  location: {
    latitude: number;
    longitude: number;
  }
}

export interface Place {
  name: string;
  workingHours: string;
  atmosphere: string;
  advice: string;
  images: { link: string, title: string }[];
  location: GoogleMaps;
}
