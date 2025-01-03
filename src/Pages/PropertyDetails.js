import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaPlus,
  FaCheck,
} from "react-icons/fa";
import api from "../api";
import Footer from "../Components/Footer";
import LoanCalculator from "../Components/LoanCalculator";
import config from "../Config/Config";
import { useAuth } from "../Context/AuthContext";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [note, setNote] = useState("");
  const [wishlistNote, setWishlistNote] = useState("");
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const fetchWishlistStatus = async (propertyId) => {
    try {
      const response = await api.get(`/wishlist/mine`);
      const wishlistItem = response.data.items.find(
        (item) => item.property === propertyId
      );
      if (wishlistItem) {
        setIsInWishlist(true);
        setWishlistNote(wishlistItem.note || "");
      } else {
        setIsInWishlist(false);
        setWishlistNote("");
      }
    } catch (error) {
      console.error("Error fetching wishlist status:", error);
    }
  };

  const fetchPropertyDetails = async (propertyId) => {
    setLoading(true);
    try {
      const response = await api.get(`/properties/by-id/${propertyId}`);
      setProperty(response.data);
      await fetchWishlistStatus(propertyId);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPropertyDetails(id);
    }
  }, [id]);

  const handleWishlist = async () => {
    if (isInWishlist) {
      try {
        setAddingToWishlist(true);
        await api.delete(`/wishlist/remove/${id}`);
        setIsInWishlist(false);
        setWishlistNote("");
      } catch (error) {
        console.error("Error managing wishlist:", error);
      } finally {
        setAddingToWishlist(false);
      }
    } else {
      setShowNoteModal(true);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      setAddingToWishlist(true);
      await api.post(`/wishlist/add/${id}`, { note });
      setIsInWishlist(true);
      setWishlistNote(note);
      setShowNoteModal(false);
      setNote("");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    } finally {
      setAddingToWishlist(false);
    }
  };

  const getContentItems = () => [
    ...(property?.fotos?.map((foto) => ({
      type: "image",
      src: `${config.API_URL}/${foto}`,
    })) || []),
    ...(property?.videos?.map((video) => ({
      type: "video",
      src: `${config.API_URL}/${video}`,
    })) || []),
    ...(property?.plants?.map((plant) => ({
      type: "plant",
      src: `${config.API_URL}/${plant}`,
    })) || []),
  ];

  const contentItems = getContentItems();

  useEffect(() => {
    if (!isVideoPlaying && contentItems.length > 0) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % contentItems.length);
      }, 10000);
    }

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, contentItems, isVideoPlaying]);

  const prevItem = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + contentItems.length) % contentItems.length
    );
  };

  const nextItem = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % contentItems.length);
  };

  // Função auxiliar para formatar textos baseados em quantidade
  const formatFeatureText = (value, singularText, pluralText, zeroText) => {
    if (value === 0) return zeroText;
    if (value === 1) return `${value} ${singularText}`;
    return `${value} ${pluralText}`;
  };

  // Função para formatar as comodidades
  const formatAmenities = (features) => {
    const amenities = [];
    if (features.airConditioning) amenities.push("Ar Condicionado");
    if (features.builtInCabinets) amenities.push("Armários Embutidos");
    if (features.elevator) amenities.push("Elevador");
    if (features.balcony) amenities.push("Varanda");
    if (features.garden) amenities.push("Jardim");
    if (features.pool) amenities.push("Piscina");

    if (amenities.length === 0) return "Sem comodidades adicionais";
    if (amenities.length === 1) return amenities[0];
    return amenities.join(" • ");
  };

  const handleAgentClick = () => {
    if (property.agent?._id) {
      navigate(`/agent/${property.agent._id}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!property) return <p>No property data available</p>;

  return (
    <>
      <div
        className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 mt-10"
        style={{ fontFamily: "Glacial Indifference" }}
      >
        <div className="flex flex-wrap w-full mx-auto mt-[100px] px-4 sm:px-8">
          <div className="w-full sm:w-1/2 flex flex-col items-center mb-8 sm:mb-0 relative">
            <div
              className="relative w-full h-72 sm:h-[500px] overflow-hidden rounded-lg"
              onMouseEnter={() => setShowArrows(true)}
              onMouseLeave={() => setShowArrows(false)}
            >
              {contentItems.length > 0 ? (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {contentItems[currentIndex]?.type === "image" && (
                    <img
                      src={contentItems[currentIndex].src}
                      alt={`Property ${currentIndex + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  )}
                  {contentItems[currentIndex]?.type === "video" && (
                    <video
                      ref={videoRef}
                      src={contentItems[currentIndex].src}
                      controls
                      className="w-full h-full object-cover rounded-lg"
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      onEnded={() => {
                        setIsVideoPlaying(false);
                        nextItem();
                      }}
                    />
                  )}
                  {contentItems[currentIndex]?.type === "plant" && (
                    <img
                      src={contentItems[currentIndex].src}
                      alt="Property plan"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
                </motion.div>
              ) : (
                <p className="text-red-500 text-center">
                  Não há imagens, vídeos ou plantas disponíveis.
                </p>
              )}

              {showArrows && (
                <>
                  <button
                    onClick={prevItem}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white rounded-full p-2 hover:bg-opacity-70 transition"
                  >
                    <FaChevronLeft size={15} />
                  </button>
                  <button
                    onClick={nextItem}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white rounded-full p-2 hover:bg-opacity-70 transition"
                  >
                    <FaChevronRight size={15} />
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap justify-center items-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentIndex(0)}
                className="p-2"
                disabled={!property.fotos?.length}
                style={{ color: property.fotos?.length ? "black" : "red" }}
              >
                Imagens ({property.fotos?.length || 0})
              </button>
              <button
                onClick={() => setCurrentIndex(property.fotos.length)}
                className="p-2"
                disabled={!property.videos?.length}
                style={{ color: property.videos?.length ? "black" : "red" }}
              >
                Vídeos ({property.videos?.length || 0})
              </button>
              <button
                onClick={() =>
                  setCurrentIndex(
                    property.fotos.length + property.videos.length
                  )
                }
                className="p-2"
                disabled={!property.plants?.length}
                style={{ color: property.plants?.length ? "black" : "red" }}
              >
                Plantas ({property.plants?.length || 0})
              </button>
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
          </div>

          <div className="w-full sm:w-1/2 flex flex-col justify-start bg-gray-100 p-4 sm:p-6 rounded-lg">
            {property.status === "Reserved" && (
              <div className="mb-4 bg-red-100 border-l-4 border-red-600 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600 font-medium">
                      Este imóvel encontra-se atualmente reservado
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {property.street} {property.doorNumber} | {property.city}
              </h2>
              {user?.role === "client" && ( // Verifica se o usuário é um cliente antes de mostrar o botão
                <button
                  onClick={handleWishlist}
                  disabled={addingToWishlist}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isInWishlist
                      ? "bg-[#585959] text-[#f4f5f5]"
                      : "bg-[#f4f5f5] text-[#585959] border-2 border-[#585959] hover:bg-gray-300"
                  }`}
                  title={
                    isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"
                  }
                >
                  {isInWishlist ? <FaCheck size={12} /> : <FaPlus size={12} />}
                </button>
              )}
            </div>

            {showNoteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Adicionar à Wishlist
                  </h3>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Adicione uma nota (opcional)"
                    className="w-full h-32 p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#585959]"
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowNoteModal(false);
                        setNote("");
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddToWishlist}
                      disabled={addingToWishlist}
                      className="px-4 py-2 bg-[#585959] text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                      {addingToWishlist ? "Adicionando..." : "Adicionar"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            <p className="mt-2 text-gray-600">
              T{property.bedrooms} |{" "}
              {property.garageSize > 0
                ? formatFeatureText(
                    property.garageSize,
                    "Lugar de garagem",
                    "Lugares de garagem",
                    "Sem garagem"
                  )
                : "Sem garagem"}
            </p>
            <p className="text-2xl font-extrabold text-gray-700 mt-3 text-right">
              {property.price}€
            </p>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Descrição</h3>
              <p className="text-gray-600 whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {isInWishlist && wishlistNote && (
              <div className="mt-4 p-4 bg-[#f4f5f5] rounded-lg">
                <h3 className="text-md font-semibold mb-2">Nota da Wishlist</h3>
                <p className="text-gray-600 whitespace-pre-line">
                  {wishlistNote}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10 ml-10">
          <div>
            <h3 className="text-xl font-semibold mb-4">
              Características Específicas
            </h3>
            <ul className="list-none space-y-2">
              <li>Tipo: {property.type}</li>
              {property.type === "Moradia" ||
              property.type === "Apartamento" ? (
                <>
                  <li>Área Total: {property.size} m²</li>
                  <li>T{property.bedrooms}</li>
                  <li>
                    {formatFeatureText(
                      property.bathrooms,
                      "Casa de Banho",
                      "Casas de Banho",
                      "Sem casas de banho"
                    )}
                  </li>
                  <li>
                    {formatFeatureText(
                      property.floors,
                      "Andar",
                      "Andares",
                      "Sem informação sobre andares"
                    )}
                  </li>
                  <li>Estado: {property.condition}</li>
                  {property.garageSize >= 0 && (
                    <li>
                      {formatFeatureText(
                        property.garageSize,
                        "Lugar de garagem",
                        "Lugares de garagem",
                        "Sem garagem"
                      )}
                    </li>
                  )}
                  <li>
                    <span className="font-medium">Comodidades: </span>
                    {formatAmenities(property.features)}
                  </li>
                </>
              ) : null}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Agente Responsável</h3>
            <div
              onClick={handleAgentClick}
              className="bg-gray-100 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                {property.agent?.image ? (
                  <img
                    src={`${config.API_URL}/${property.agent.image}`}
                    alt={property.agent.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-2xl">
                      {property.agent?.name?.charAt(0) || "A"}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-lg">
                    {property.agent?.name}
                  </h4>
                  {property.agent?.employer && (
                    <p className="text-gray-600 text-sm mb-1">
                      {property.agent.employer}
                    </p>
                  )}
                  <p className="text-gray-600 text-sm">
                    {property.agent?.email}
                  </p>
                  {property.agent?.phone && (
                    <p className="text-gray-600 text-sm">
                      {property.agent.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <LoanCalculator />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PropertyDetails;
