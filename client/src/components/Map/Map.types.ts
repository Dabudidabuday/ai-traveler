export interface PlaceLocation {
  key: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
}
