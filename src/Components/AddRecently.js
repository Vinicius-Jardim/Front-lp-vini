import React, { useEffect, useState } from "react";
import api from "../api";
import config from "../Config/Config";
import { useNavigate } from "react-router-dom";
import {
  FaChevronLeft,
  FaChevronRight,
  FaBath,
  FaBed,
  FaRulerCombined,
  FaCar,
  FaTree,
} from "react-icons/fa";

const AddRecently = () => {
  const [newProperties, setNewProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewReleases = async () => {
      try {
        const response = await api.get("/properties/new-releases");
        if (response.data && Array.isArray(response.data)) {
          setNewProperties(response.data);
        } else if (response.data && Array.isArray(response.data.response)) {
          setNewProperties(response.data.response);
        } else {
          console.error("Formato de resposta inesperado:", response.data);
          setError("Formato de resposta inválido do servidor");
        }
      } catch (error) {
        console.error("Erro ao buscar propriedades:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Erro ao buscar propriedades"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNewReleases();
  }, []);

  const handleCardClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const nextImage = (e, propertyId) => {
    e.stopPropagation();
    setCurrentImageIndex((prevState) => ({
      ...prevState,
      [propertyId]:
        prevState[propertyId] ===
        newProperties.find((prop) => prop._id === propertyId).fotos.length - 1
          ? 0
          : (prevState[propertyId] || 0) + 1,
    }));
  };

  const prevImage = (e, propertyId) => {
    e.stopPropagation();
    setCurrentImageIndex((prevState) => ({
      ...prevState,
      [propertyId]:
        prevState[propertyId] === 0
          ? newProperties.find((prop) => prop._id === propertyId).fotos.length -
            1
          : (prevState[propertyId] || 0) - 1,
    }));
  };

  return (
    <section className="container-main-recents py-8 bg-[#f4f5f5]">
      <h3 className="text-3xl md:text-4xl lg:text-5xl xl:text-4xl ml-10 font-semibold mb-9">
        Adicionado Recentemente
      </h3>
      <div className="container-recents max-w-screen-xl mx-auto px-4">
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {!loading && !error && newProperties.length === 0 && (
          <p>No new properties found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {newProperties.map((property) => (
            <div
              className="w-100 h-100 m-4 cursor-pointer bg-[#f4f5f5]"
              key={property._id}
              onClick={() => handleCardClick(property._id)}
            >
              <div className="w-full h-2/3 bg-gray-300 overflow-hidden relative rounded-t-lg">
                {property.fotos && property.fotos.length > 0 ? (
                  <img
                    src={`${config.API_URL}/${
                      property.fotos[currentImageIndex[property._id] || 0]
                    }`}
                    alt={`Foto ${(currentImageIndex[property._id] || 0) + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    Imagem indisponível
                  </div>
                )}
                {property.status === "Reserved" && (
                  <div className="absolute top-5 -right-8 transform rotate-45 w-32 text-center bg-red-600 text-white py-1 shadow-lg z-10">
                    <span className="font-semibold text-xs tracking-wider">
                      RESERVADO
                    </span>
                  </div>
                )}
                <button
                  onClick={(e) => prevImage(e, property._id)}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white rounded-full p-2 hover:bg-opacity-50 transition"
                >
                  <FaChevronLeft size={10} />
                </button>
                <button
                  onClick={(e) => nextImage(e, property._id)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white rounded-full p-2 hover:bg-opacity-50 transition"
                >
                  <FaChevronRight size={10} />
                </button>
              </div>
              <div className="flex flex-col p-4 bg-[#f4f5f5] rounded-b-lg h-1/3">
                <p className="text-sm text-gray-500">{property.type}</p>
                <h6 className="text-md font-semibold">
                  {property.street} {property.doorNumber} | {property.city}
                </h6>
                {property.type === "Terreno" ? (
                  <div className="flex items-center space-x-1 text-sm">
                    <span>{property.size} m²</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-sm">
                    <p>
                      T{property.bedrooms} | {property.bathrooms} Casas de Banho
                      | {property.garageSize} Garagem{" "}
                    </p>
                  </div>
                )}
                <p className="text-2xl font-bold text-black-600 mb-4 text-right">
                  {property.price}€
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AddRecently;
