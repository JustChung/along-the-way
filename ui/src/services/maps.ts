// src/services/maps.ts
import { Location, RoutePreferences } from '../types';

class MapsService {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  }

  async geocodeAddress(address: string): Promise<Location> {
    const geocoder = new google.maps.Geocoder();

    try {
      const result = await geocoder.geocode({ address });
      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng(),
          address: result.results[0].formatted_address,
        };
      }
      throw new Error('No results found');
    } catch (error) {
      throw new Error(`Geocoding failed: ${error}`);
    }
  }

  async getDirections(origin: Location, destination: Location): Promise<google.maps.DirectionsResult> {
    const directionsService = new google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      });
      return result;
    } catch (error) {
      throw new Error(`Directions request failed: ${error}`);
    }
  }

  getSamplePoints(path: google.maps.LatLng[], interval: number): Location[] {
    const points: Location[] = [];
    let distance = 0;

    for (let i = 0; i < path.length - 1; i++) {
      const segmentPath = [path[i], path[i + 1]];
      const segmentLength = google.maps.geometry.spherical.computeLength(segmentPath);

      while (distance < segmentLength) {
        const fraction = distance / segmentLength;
        const point = google.maps.geometry.spherical.interpolate(path[i], path[i + 1], fraction);

        points.push({
          lat: point.lat(),
          lng: point.lng(),
          address: '',
        });

        distance += interval;
      }
      distance = 0;  // Reset distance for the next segment
    }

    return points;
  }
}

export const mapsService = new MapsService();
