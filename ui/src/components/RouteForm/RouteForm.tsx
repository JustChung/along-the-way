// src/components/RouteForm/RouteForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { RoutePreferences } from '../../types';

interface RouteFormProps {
  onSubmit: (data: RouteFormData) => void;
  preferences: RoutePreferences | null; // Added preferences prop
}

interface RouteFormData {
  origin: string;
  destination: string;
  preferences: RoutePreferences; // Ensure preferences are included in the form data
}

const RouteForm: React.FC<RouteFormProps> = ({ onSubmit, preferences }) => {
  const { register, handleSubmit } = useForm<RouteFormData>({
    defaultValues: {
      preferences: {
        maxDetourTime: preferences?.maxDetourTime || 0,
        numberOfStops: preferences?.numberOfStops || 0,
        cuisineTypes: preferences?.cuisineTypes.join(', ') || '',
        establishmentType: preferences?.establishmentType.join(', ') || '',
      }
    }
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        // Ensure preferences are structured correctly
        const structuredData: RouteFormData = {
          origin: data.origin,
          destination: data.destination,
          preferences: {
            maxDetourTime: data.preferences.maxDetourTime || preferences?.maxDetourTime,
            numberOfStops: data.preferences.numberOfStops || preferences?.numberOfStops,
            cuisineTypes: data.preferences.cuisineTypes
              ? data.preferences.cuisineTypes.split(',').map((c) => c.trim())
              : preferences?.cuisineTypes,
            establishmentType: data.preferences.establishmentType
              ? data.preferences.establishmentType.split(',').map((e) => e.trim())
              : preferences?.establishmentType,
          },
        };

        onSubmit(structuredData); // Call the onSubmit prop with the structured data
      })}
      className="space-y-4"
    >
      <div>
        <input
          {...register('origin', { required: true })} // Added validation
          placeholder="Starting point"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input
          {...register('destination', { required: true })} // Added validation
          placeholder="Destination"
          className="w-full p-2 border rounded"
        />
      </div>
      {/* Add preference inputs */}
      {preferences && (
        <>
          <div>
            <label>
              Max Detour Time (minutes):
              <input
                type="number"
                {...register('preferences.maxDetourTime', { valueAsNumber: true })} // Ensure value is treated as a number
                defaultValue={preferences.maxDetourTime} // Example default value
              />
            </label>
          </div>
          <div>
            <label>
              Number of Stops:
              <input
                type="number"
                {...register('preferences.numberOfStops', { valueAsNumber: true })} // Ensure value is treated as a number
                defaultValue={preferences.numberOfStops} // Example default value
              />
            </label>
          </div>
          <div>
            <label>
              Cuisine Types (comma separated):
              <input
                type="text"
                {...register('preferences.cuisineTypes')}
                defaultValue={preferences.cuisineTypes.join(', ')} // Example default value
              />
            </label>
          </div>
          <div>
            <label>
              Establishment Type (comma separated):
              <input
                type="text"
                {...register('preferences.establishmentType')}
                defaultValue={preferences.establishmentType.join(', ')} // Example default value
              />
            </label>
          </div>
        </>
      )}
      <button type="submit" className="mt-4 p-2 bg-blue-600 text-white rounded">Submit</button>
    </form>
  );
};

export default RouteForm;
