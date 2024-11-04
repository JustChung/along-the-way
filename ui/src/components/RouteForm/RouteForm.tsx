// // src/components/RouteForm/RouteForm.tsx
// import React from 'react';
// import { useForm } from 'react-hook-form';
// import { RoutePreferences } from '../../types';

// interface RouteFormProps {
//   onSubmit: (data: RouteFormData) => void;
//   preferences: RoutePreferences | null; // Added preferences prop
// }

// interface RouteFormData {
//   origin: string;
//   destination: string;
//   stops: string;
//   search: string;
//   preferences: RoutePreferences; // Ensure preferences are included in the form data
// }

// const RouteForm: React.FC<RouteFormProps> = ({ onSubmit, preferences }) => {
//   const { register, handleSubmit } = useForm<RouteFormData>({
//     defaultValues: {
//       preferences: {
//         maxDetourTime: preferences?.maxDetourTime || 0,
//         numberOfStops: preferences?.numberOfStops || 0,
//         cuisineTypes: preferences?.cuisineTypes.join(', ') || '',
//         establishmentType: preferences?.establishmentType.join(', ') || '',
//       }
//     }
//   });

//   return (
//     <form
//       onSubmit={handleSubmit((data) => {
//         // Ensure preferences are structured correctly
//         const structuredData: RouteFormData = {
//           origin: data.origin,
//           destination: data.destination,
//           preferences: {
//             maxDetourTime: data.preferences.maxDetourTime || preferences?.maxDetourTime,
//             numberOfStops: data.preferences.numberOfStops || preferences?.numberOfStops,
//             cuisineTypes: data.preferences.cuisineTypes
//               ? data.preferences.cuisineTypes.split(',').map((c) => c.trim())
//               : preferences?.cuisineTypes,
//             establishmentType: data.preferences.establishmentType
//               ? data.preferences.establishmentType.split(',').map((e) => e.trim())
//               : preferences?.establishmentType,
//           },
//         };

//         onSubmit(structuredData); // Call the onSubmit prop with the structured data
//       })}
//       className="space-y-4"
//     >
//       {/* Search Bar: optional input */}
//       <div className="relative">
//         <input
//           {...register('search', { required: false })}
//           placeholder="Search"
//           className="w-full p-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
//           viewBox="0 0 20 20"
//           fill="currentColor"
//         >
//           <path
//             fillRule="evenodd"
//             d="M12.9 14.32a8 8 0 111.414-1.414l4.242 4.242a1 1 0 01-1.414 1.414l-4.242-4.242zm-1.4-6.32a5 5 0 11-10 0 5 5 0 0110 0z"
//             clipRule="evenodd"
//           />
//         </svg>
//       </div>
      
//       {/* Other inputs: required */}
//       <div>
//         <input
//           {...register('origin', { required: true })} // Added validation
//           placeholder="Starting point"
//           className="w-full p-2 border rounded"
//         />
//       </div>
//       <div>
//         <input
//           {...register('destination', { required: true })} // Added validation
//           placeholder="Destination"
//           className="w-full p-2 border rounded"
//         />
//       </div>
//       <div>
//         <input
//           {...register('stops', { required: true })} // Added validation
//           placeholder="Number of stops along the way"
//           className="w-full p-2 border rounded"
//         />
//       </div>
//       {/* Add preference inputs */}
//       {preferences && (
//         <>
//           <div>
//             <label>
//               Max Detour Time (minutes):
//               <input
//                 type="number"
//                 {...register('preferences.maxDetourTime', { valueAsNumber: true })} // Ensure value is treated as a number
//                 defaultValue={preferences.maxDetourTime} // Example default value
//               />
//             </label>
//           </div>
//           <div>
//             <label>
//               Number of Stops:
//               <input
//                 type="number"
//                 {...register('preferences.numberOfStops', { valueAsNumber: true })} // Ensure value is treated as a number
//                 defaultValue={preferences.numberOfStops} // Example default value
//               />
//             </label>
//           </div>
//           <div>
//             <label>
//               Cuisine Types (comma separated):
//               <input
//                 type="text"
//                 {...register('preferences.cuisineTypes')}
//                 defaultValue={preferences.cuisineTypes.join(', ')} // Example default value
//               />
//             </label>
//           </div>
//           <div>
//             <label>
//               Establishment Type (comma separated):
//               <input
//                 type="text"
//                 {...register('preferences.establishmentType')}
//                 defaultValue={preferences.establishmentType.join(', ')} // Example default value
//               />
//             </label>
//           </div>
//         </>
//       )}
//       <button type="submit" className="mt-4 p-2 bg-blue-600 text-white rounded">Submit</button>
//     </form>
//   );
// };

// export default RouteForm;


// src/components/RouteForm/RouteForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RoutePreferences } from '../../types';
import StarRating from './StarRating'; // Import StarRating component

interface RouteFormProps {
  onSubmit: (data: RouteFormData) => void;
  preferences: RoutePreferences | null; // Added preferences prop
}

interface RouteFormData {
  origin: string;
  destination: string;
  stops: number;
  search: string;
  rating: number; // Add rating to the form data
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
      },
      rating: 0, // Initialize rating
    }
  });

  const [rating, setRating] = useState<number>(0); // Local state for rating

  return (
    <form
      onSubmit={handleSubmit((data) => {
        // Ensure preferences are structured correctly
        const structuredData: RouteFormData = {
          origin: data.origin,
          destination: data.destination,
          stops: data.stops,
          search: data.search,
          rating: data.rating,

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
          rating, // Add the rating to the structured data
        };

        onSubmit(structuredData); // Call the onSubmit prop with the structured data
      })}
      className="space-y-4"
    >
      {/* Search Bar: optional input */}
      <div className="relative">
        <input
          {...register('search', { required: false })}
          placeholder="Search"
          className="w-full p-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.9 14.32a8 8 0 111.414-1.414l4.242 4.242a1 1 0 01-1.414 1.414l-4.242-4.242zm-1.4-6.32a5 5 0 11-10 0 5 5 0 0110 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      
      {/* Other inputs: required */}
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
      <div>
        <input
          {...register('stops', { required: true })} // Added validation
          placeholder="Number of stops along the way"
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Star Rating Input */}
      <div>
        <label className="block mb-2">Rating:</label>
        <StarRating rating={rating} onRatingChange={setRating} />
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