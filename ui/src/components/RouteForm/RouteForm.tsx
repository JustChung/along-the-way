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
  const { register, handleSubmit } = useForm<RouteFormData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <input
          {...register('origin')}
          placeholder="Starting point"
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <input
          {...register('destination')}
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
                {...register('preferences.maxDetourTime')}
                defaultValue={preferences.maxDetourTime} // Example default value
              />
            </label>
          </div>
          <div>
            <label>
              Number of Stops:
              <input
                type="number"
                {...register('preferences.numberOfStops')}
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
    </form>
  );
};

export default RouteForm;
