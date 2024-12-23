export interface MessageRequest {
  message: string;
  country: string;
  city: string;
  isWalkingTrip: boolean;
  tripTheme?: string;
  tripDuration?: string;
}
