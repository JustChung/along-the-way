// src/components/RouteChip/RouteChip.tsx

import { Input, Card, CardBody, Typography, CardFooter, Button } from "@material-tailwind/react";
import React from 'react';
import { Restaurant } from '../../types';
import { MapPinIcon, MapIcon } from "@heroicons/react/24/outline";

interface RouteCardProps {
    source?: string;
    destination?: string;
    stops?: Restaurant[];
    onSelect: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ source, destination, stops, onSelect }) => {
  return (
    <div className="space-y-4">
      <Card className="mt-6 w-96 opacity-[.96]" onClick={onSelect}>
        <CardBody>
          <Typography variant="h5" color="blue-gray" className="mb-2 gap-2 flex items-center">
            <MapIcon className="w-8 p-1"/><span className="text-center">Route</span>
          </Typography>
          <Typography color="blue-gray" className="mb-2">
          <span className="flex gap-2 border-2 rounded-md p-2"><MapPinIcon className="w-5" color="#00AB41"/>{source ? source : "Source"}</span>
          </Typography>
          <Typography color="blue-gray" className="mb-2">
           <span className="flex gap-2 border-2 rounded-md p-2"><MapPinIcon className="w-5" color="#FF474C"/>{destination ? destination : "Destination"}</span>
          </Typography>
          {/* <Input label="Input With Icon" value={source} icon={<i className="fas fa-heart" />} />
          <Input label="Input With Icon" value={destination} icon={<i className="fas fa-heart" />} /> */}
        </CardBody>
        
        {!source || !destination ? 
        <CardFooter className="pt-0">
          <Button>Find route</Button>
        </CardFooter>
        : ""}
      </Card>
    </div>
  );
};

export default RouteCard;
