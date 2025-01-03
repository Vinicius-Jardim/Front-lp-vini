import React, { useEffect, useState } from "react";
import api from "../api";
import SideFilters from "../Components/SideFilters";
import Footer from "../Components/Footer";
import { useNavigate, useSearchParams } from "react-router-dom";
import Property from "../Components/Property";
import { FaFilter, FaTimes } from "react-icons/fa";

const RealState = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(9);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page")) || 1;

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParams);
      params.set("page", page);
      params.set("limit", limit);

      console.log("Fetching properties with params:", params.toString());
      const response = await api.get(`/properties/all?${params.toString()}`);
      console.log("API Response:", response.data);

      if (response.data && response.data.response) {
        setHouses(response.data.response.properties || []);
        setTotalPages(response.data.response.pages || 1);
        console.log("Properties loaded:", response.data.response.properties);
      } else {
        console.error("Invalid response format:", response.data);
        setError("Invalid response format from server");
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error fetching properties"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [searchParams]);

  useEffect(() => {
    // Previne scroll da página quando os filtros estão abertos em mobile
    if (showFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showFilters]);

  const handleFilterChange = (filters) => {
    const newParams = new URLSearchParams(searchParams);

    // Adiciona os filtros aplicados aos parâmetros da URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    // Atualiza os parâmetros e fecha o menu de filtros em mobile
    setSearchParams(newParams);
    setShowFilters(false);
  };

  return (
    <>
      <div
        className={`bg-gray-100 min-h-screen pt-[120px] md:pt-[140px] ${
          showFilters ? "lg:overflow-auto overflow-hidden" : ""
        }`}
      >
        {/* Botão de filtro para mobile */}
        <div className="lg:hidden fixed bottom-4 right-4 z-10">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300"
          >
            {showFilters ? <FaTimes size={20} /> : <FaFilter size={20} />}
          </button>
        </div>

        {/* Container principal */}
        <div className="flex flex-wrap">
          {/* Filtros laterais */}
          <div
            className={`
            w-full lg:w-1/4 p-4
            fixed lg:relative
            ${showFilters ? "left-0" : "-left-full lg:left-0"}
            top-[64px] md:top-[80px] lg:top-auto
            h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] lg:h-auto
            bg-white lg:bg-transparent
            z-20 lg:z-auto
            transition-all duration-300
            flex flex-col
          `}
          >
            {/* Botão de fechar para mobile */}
            {showFilters && (
              <div className="lg:hidden fixed top-[64px] md:top-[80px] left-0 right-0 bg-white px-4 py-4 flex justify-between items-center shadow-md z-20">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-3 -mr-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Fechar filtros"
                >
                  <FaTimes size={24} className="text-gray-600" />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              <div className="pt-16 lg:pt-0 pb-20">
                <div className="lg:sticky lg:top-[140px]">
                  <SideFilters onFilterChange={handleFilterChange} />
                </div>
              </div>
            </div>
          </div>

          {/* Overlay para mobile quando os filtros estão abertos */}
          {showFilters && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
              onClick={() => setShowFilters(false)}
            />
          )}

          {/* Lista de propriedades */}
          <div className="w-full lg:w-3/4 p-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              {loading && (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              )}
              {error && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-red-500">Error: {error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {!loading && !error && houses.length > 0 ? (
                  houses.map((house) => (
                    <Property key={house._id} house={house} />
                  ))
                ) : !loading && !error ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-lg font-semibold">
                      Nenhuma propriedade encontrada.
                    </p>
                    <p className="text-gray-500 mt-2">
                      Tente ajustar seus filtros ou volte mais tarde.
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Paginação */}
              {!loading && !error && houses.length > 0 && (
                <div className="flex justify-center items-center space-x-2 mt-6 mb-3">
                  <button
                    onClick={() =>
                      setSearchParams({
                        ...Object.fromEntries(searchParams),
                        page: page - 1,
                      })
                    }
                    disabled={page === 1}
                    className="px-3 py-1 rounded hover:bg-gray-200"
                  >
                    &lt;
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() =>
                        setSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: index + 1,
                        })
                      }
                      className={`px-3 py-1 ${
                        page === index + 1 ? "font-bold bg-gray-200" : ""
                      } rounded hover:bg-gray-200`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      setSearchParams({
                        ...Object.fromEntries(searchParams),
                        page: page + 1,
                      })
                    }
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded hover:bg-gray-200"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RealState;
