import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Property from "../Components/Property";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";

const NearbyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const urlRadius = searchParams.get("radius");
  const [radius, setRadius] = useState(urlRadius ? parseInt(urlRadius) : 10);

  const fetchNearbyProperties = async (latitude, longitude, searchRadius) => {
    try {
      const response = await api.get(
        `/properties/nearby?lat=${latitude}&lng=${longitude}&radius=${searchRadius}`
      );
      console.log("API Response:", response.data);
      setProperties(response.data.properties || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching nearby properties:", error);
      setError("Erro ao buscar imóveis próximos");
      setLoading(false);
    }
  };

  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius);
    navigate(`/nearby-properties?lat=${lat}&lng=${lng}&radius=${newRadius}`);
  };

  useEffect(() => {
    if (lat && lng) {
      fetchNearbyProperties(lat, lng, radius);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            navigate(
              `/nearby-properties?lat=${latitude}&lng=${longitude}&radius=${radius}`
            );
          },
          () => {
            setError(
              "Acesso à localização negado. Por favor, permita o acesso à sua localização para ver imóveis próximos."
            );
            setLoading(false);
          },
          { enableHighAccuracy: true }
        );
      } else {
        setError("Geolocalização não é suportada pelo seu navegador.");
        setLoading(false);
      }
    }
  }, [lat, lng, radius, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-[200px] bg-[#f4f5f5]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-[200px] bg-[#f4f5f5]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f5]">
      <div className="pt-[200px]">
        <div className="w-full bg-[#f4f5f5] shadow-md z-20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                <FaSearch className="text-gray-500" size={20} />
                <h1 className="text-2xl font-bold">Imóveis Próximos</h1>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
                <span className="text-gray-600 font-medium whitespace-nowrap">
                  Raio de busca:
                </span>
                <select
                  value={radius}
                  onChange={(e) => handleRadiusChange(Number(e.target.value))}
                  className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full md:w-auto min-w-[150px]"
                >
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                  <option value={200}>200 km</option>
                  <option value={300}>300 km</option>
                  <option value={400}>400 km</option>
                  <option value={500}>500 km</option>
                  <option value={600}>Portugal inteiro</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {properties.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm p-8">
              <p className="text-gray-600 text-lg">
                Nenhum imóvel encontrado nas proximidades.
              </p>
              <p className="text-gray-500 mt-2">
                Tente aumentar o raio de busca para encontrar mais opções.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-600 text-center md:text-left">
                Encontrados {properties.length} imóveis num raio de {radius} km
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property._id} className="relative">
                    <Property house={property} />
                    {property.mapLocation && (
                      <div className="absolute bottom-[35%] right-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const [lat, lng] = property.mapLocation.split(",");
                            window.open(
                              `https://www.google.com/maps?q=${lat},${lng}`,
                              "_blank"
                            );
                          }}
                          className="bg-white/90 hover:bg-white text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors duration-200 flex items-center gap-1.5"
                          title="Ver no Google Maps"
                        >
                          <FaMapMarkerAlt className="text-gray-600" size={14} />
                          <span>Maps</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NearbyProperties;
