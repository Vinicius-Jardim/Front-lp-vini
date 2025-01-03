import React from 'react';
import { LoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../../Config/ApiKeys';

const libraries = ['places'];

const GoogleMapsLoader = ({ children }) => {
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
      {children}
    </LoadScript>
  );
};

export default GoogleMapsLoader;
