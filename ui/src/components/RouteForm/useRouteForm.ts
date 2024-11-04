// src/components/RouteForm/useRouteForm.ts
import { useForm, UseFormReturn } from 'react-hook-form';
import { RoutePreferences } from '../../types';

interface RouteFormData {
  origin: string;
  destination: string;
  preferences: RoutePreferences;
}

export const useRouteForm = (initialPreferences?: RoutePreferences): UseFormReturn<RouteFormData> => {
  const defaultPreferences: RoutePreferences = {
    maxDetourTime: 15,
    numberOfStops: 1,
    cuisineTypes: [],
    establishmentType: ['restaurant'],
    minRating: 4.0,
    priceLevel: [1, 2, 3],
    searchRadius: 1000,
  };

  return useForm<RouteFormData>({
    defaultValues: {
      preferences: initialPreferences || defaultPreferences,
    },
  });
};