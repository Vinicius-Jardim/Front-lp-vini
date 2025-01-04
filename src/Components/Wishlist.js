import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../Context/AuthContext";
import { Link } from "react-router-dom";
import { FaTrash, FaBed, FaCar, FaBath, FaRulerCombined } from "react-icons/fa";
import config from "../Config/Config";

const Wishlist = () => {
  const { authData } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removeFromWishlist = async (propertyId) => {
    try {
      await api.delete(`/wishlist/remove/${propertyId}`);
      setWishlist((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.property !== propertyId),
      }));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      if (authData.token) {
        try {
          const response = await api.get("/wishlist/mine");
          const wishlistData = response.data;

          if (wishlistData && wishlistData.items) {
            const propertiesPromises = wishlistData.items.map((item) =>
              api.get(`/properties/by-id/${item.property}`)
            );

            const propertiesResponses = await Promise.all(propertiesPromises);
            const properties = propertiesResponses.map((res) => res.data);

            const enrichedWishlist = {
              ...wishlistData,
              items: wishlistData.items.map((item, index) => ({
                ...item,
                propertyDetails: properties[index],
              })),
            };

            setWishlist(enrichedWishlist);
          } else {
            setWishlist({ items: [] });
          }
        } catch (err) {
          console.error("Error fetching wishlist:", err);
          setError("Failed to load wishlist. Please try again.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [authData.token]);

  if (loading) {
    return <div>Loading Wishlist...</div>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <section className="container-main-recents py-8 bg-[#f4f5f5]">
      <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-4xl ml-10 font-semibold mb-9">
        Minha Wishlist
      </h2>
      <div className="container-recents max-w-screen-xl mx-auto px-4">
        {wishlist && wishlist.items && wishlist.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {wishlist.items.map((item) => (
              <div
                key={item.property}
                className="w-100 h-100 m-4 cursor-pointer bg-[#f4f5f5]"
              >
                <div className="relative">
                  <button
                    onClick={() => removeFromWishlist(item.property)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                  >
                    <FaTrash className="text-gray-600 text-sm" />
                  </button>
                  <Link to={`/property/${item.property}`}>
                    <div className="w-full h-2/3 bg-gray-300 overflow-hidden relative rounded-t-lg">
                      <img
                        src={
                          item.propertyDetails?.fotos &&
                          item.propertyDetails.fotos.length > 0
                            ? `${config.API_URL}/${item.propertyDetails.fotos[0]}`
                            : "https://via.placeholder.com/400x300?text=No+Image+Available"
                        }
                        alt={item.propertyDetails?.street || "Property"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col p-4 bg-[#f4f5f5] rounded-b-lg h-1/3">
                      <p className="text-sm text-gray-500">
                        {item.propertyDetails?.type}
                      </p>
                      <h6 className="text-md font-semibold">
                        {item.propertyDetails?.street}{" "}
                        {item.propertyDetails?.doorNumber} |{" "}
                        {item.propertyDetails?.city}
                      </h6>
                      {item.propertyDetails?.type === "Terreno" ? (
                        <div className="flex items-center space-x-1 text-sm">
                          <span>{item.propertyDetails?.size} m²</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center space-x-1 text-sm">
                            <p>
                              T{item.propertyDetails?.bedrooms} |{" "}
                              {item.propertyDetails?.bathrooms} Casas de Banho |{" "}
                              {item.propertyDetails?.garageSize} Garagem
                            </p>
                          </div>
                          {item.note && (
                            <p className="mt-2 text-sm text-gray-500 italic">
                              Nota: {item.note}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            Nenhum item na wishlist.
          </p>
        )}
      </div>
    </section>
  );
};

export default Wishlist;
