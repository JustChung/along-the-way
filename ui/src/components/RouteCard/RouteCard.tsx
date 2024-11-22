// src/components/RouteChip/RouteChip.tsx

import { Input, Card, CardBody, Typography, CardFooter, Button } from "@material-tailwind/react";
import React from 'react';
import { Restaurant } from '../../types';
import { MapPinIcon } from "@heroicons/react/24/solid";

interface RouteCardProps {
    source?: string;
    destination?: string;
    stops?: Restaurant[];
    onSelect: () => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ source, destination, stops, onSelect }) => {
  return (
    <div className="space-y-4">
      <Card className="mt-6 w-96" onClick={onSelect}>
        <CardBody>
          <Typography variant="h5" color="blue-gray" className="mb-2">
            <span className="flex gap-2"><img src="/route-icon.png" className="w-8 p-1"></img>Route</span>
          </Typography>
          <Typography color="blue-gray" className="mb-2">
          <span className="flex gap-2 border-2 rounded-md"><MapPinIcon className="w-5" color="#00AB41"/>{source ? source : "Source"}</span>
          </Typography>
          <Typography color="blue-gray" className="mb-2">
           <span className="flex gap-2 border-2 rounded-md"><MapPinIcon className="w-5" color="#FF474C"/>{destination ? destination : "Destination"}</span>
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
