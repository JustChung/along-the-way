// src/components/RouteChip/RouteChip.tsx

import { Input, Card, CardBody, Typography, CardFooter } from "@material-tailwind/react";
import React from 'react';
import { Restaurant } from '../../types';

interface RouteCardProps {
    source: String;
    destination: String;
    stops: Restaurant[];
    onSelect: (restaurant: Restaurant) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ source, destination, stops, onSelect }) => {
  return (
    <div className="space-y-4">
      <Card className="mt-6 w-96">
        <CardBody>
          <Typography variant="h5" color="blue-gray" className="mb-2">
            Route
          </Typography>
          <Input label="Input With Icon" value="test" icon={<i className="fas fa-heart" />} />
          <Input label="Input With Icon" value="test" icon={<i className="fas fa-heart" />} />
        </CardBody>
        <CardFooter className="pt-0">
          <Button>Read More</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RouteCard;
