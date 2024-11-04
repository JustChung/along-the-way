// src/hooks/usePlacesAutocomplete.ts
import { useEffect, useRef } from 'react';

export const usePlacesAutocomplete = (inputId: string, options?: google.maps.places.AutocompleteOptions) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (window.google) {
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) {
        autocompleteRef.current = new google.maps.places.Autocomplete(input, {
          types: ['address'],
          ...options,
        });
      }
    }
    
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [inputId, options]);

  return autocompleteRef.current;
};