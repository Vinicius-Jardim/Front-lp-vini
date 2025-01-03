import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const mapStyles = {
  height: "400px",
  width: "100%",
  marginBottom: "20px",
  borderRadius: "8px",
};

const GoogleMapComponent = React.memo(({ center, onClick, selectedLocation }) => {
  return (
    <GoogleMap
      mapContainerStyle={mapStyles}
      zoom={13}
      center={center}
      onClick={onClick}
    >
      {selectedLocation && (
        <Marker
          position={selectedLocation}
          draggable={true}
          onDragEnd={onClick}
        />
      )}
    </GoogleMap>
  );
});

export default GoogleMapComponent;
