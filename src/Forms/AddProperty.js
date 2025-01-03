import React, { useState, useCallback } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import GoogleMapComponent from "../Components/GoogleMaps/GoogleMapComponent";

const libraries = ["places"];

const mapStyles = {
  height: "400px",
  width: "100%",
  marginBottom: "20px",
  borderRadius: "8px",
};

// Property type and condition enums matching the backend
const propertyTypes = {
  HOUSE: "Moradia",
  APARTMENT: "Apartamento",
  LAND: "Terreno",
};

const propertyConditions = {
  HOUSEANDAPARTMENT: [
    "Nova Construção",
    "Recentemente Renovada",
    "Construção Antiga",
  ],
  LAND: ["Agrícola", "Urbano", "Rural"],
};

const AddProperty = () => {
  const navigate = useNavigate();
  const { authData } = useAuth();
  const [formData, setFormData] = useState({
    type: "",
    street: "",
    size: 0,
    condition: "",
    bedrooms: 0,
    bathrooms: 0,
    floors: 0,
    garageSize: 0,
    doorNumber: "",
    parish: "",
    city: "",
    price: 0,
    description: "",
    mapLocation: "",
    status: "Available",
    features: {
      airConditioning: false,
      builtInCabinets: false,
      elevator: false,
      balcony: false,
      garden: false,
      pool: false,
    },
    customFeatures: [],
  });

  const [files, setFiles] = useState({
    fotos: [],
    videos: [],
    plants: [],
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 41.366873, // Coordenadas default para Porto
    lng: -8.194834,
  });

  const handleMapClick = useCallback(
    (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelectedLocation({ lat, lng });
      setFormData((prev) => ({
        ...prev,
        mapLocation: `${lat},${lng}`,
      }));
    },
    [setSelectedLocation, setFormData]
  );

  const onMapLoad = useCallback(
    (map) => {
      // Se já existirem coordenadas no formData.mapLocation, centralizar o mapa nelas
      if (formData.mapLocation) {
        const [lat, lng] = formData.mapLocation.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          setMapCenter({ lat, lng });
          setSelectedLocation({ lat, lng });
        }
      }
    },
    [formData.mapLocation, setMapCenter, setSelectedLocation]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Validação para campos numéricos com máximo de 2 dígitos
      if (["bedrooms", "bathrooms", "garageSize", "floors"].includes(name)) {
        if (value === "" || (parseInt(value) >= 0 && parseInt(value) <= 99)) {
          setFormData((prev) => ({ ...prev, [name]: value }));
        }
        return;
      }

      // Validação para o campo de preço
      if (name === "price") {
        // Permite apenas números e um único ponto/vírgula decimal
        const priceRegex = /^\d*[.,]?\d*$/;
        if (value === "" || priceRegex.test(value)) {
          setFormData((prev) => ({ ...prev, [name]: value }));
        }
        return;
      }

      // Se o tipo de imóvel foi alterado
      if (name === "type") {
        const isLand = value === propertyTypes.LAND;

        return setFormData((prev) => ({
          ...prev,
          [name]: value,
          // Limpa características se for terreno
          features: isLand
            ? {
                airConditioning: false,
                builtInCabinets: false,
                elevator: false,
                balcony: false,
                garden: false,
                pool: false,
              }
            : prev.features,
          // Limpa campos específicos se for terreno
          bedrooms: isLand ? "" : prev.bedrooms,
          bathrooms: isLand ? "" : prev.bathrooms,
          floors: isLand ? "" : prev.floors,
          garageSize: isLand ? "" : prev.garageSize,
          // Reseta a condição pois as opções são diferentes
          condition: "",
        }));
      }

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [setFormData]
  );

  const handleFeatureChange = useCallback(
    (feature) => {
      setFormData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          [feature]: !prev.features[feature],
        },
      }));
    },
    [setFormData]
  );

  const handleFileChange = useCallback(
    (e, type) => {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => ({
        ...prev,
        [type]: [...prev[type], ...newFiles],
      }));
    },
    [setFiles]
  );

  const removeFile = useCallback(
    (type, index) => {
      setFiles((prev) => ({
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index),
      }));
    },
    [setFiles]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        const formDataToSend = new FormData();

        // Append all form fields individually
        formDataToSend.append("type", formData.type);
        formDataToSend.append("street", formData.street);
        formDataToSend.append("size", formData.size);
        formDataToSend.append("condition", formData.condition);
        formDataToSend.append("bedrooms", formData.bedrooms);
        formDataToSend.append("bathrooms", formData.bathrooms);
        formDataToSend.append("floors", formData.floors);
        formDataToSend.append("garageSize", formData.garageSize);
        formDataToSend.append("doorNumber", formData.doorNumber);
        formDataToSend.append("parish", formData.parish);
        formDataToSend.append("city", formData.city);
        formDataToSend.append("price", formData.price);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("mapLocation", formData.mapLocation);
        formDataToSend.append("status", formData.status);

        // Append features as array
        const activeFeatures = Object.entries(formData.features)
          .filter(([_, value]) => value === true)
          .map(([key]) => key);

        formDataToSend.append(
          "features",
          activeFeatures.length ? activeFeatures.join(",") : ""
        );

        // Append files
        Object.keys(files).forEach((fileType) => {
          files[fileType].forEach((file) => {
            formDataToSend.append(fileType, file);
          });
        });

        // Log the form data for debugging
        for (let pair of formDataToSend.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }

        const response = await api.post("/properties/add", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authData.token}`,
          },
        });

        if (response.status === 201) {
          navigate("/agent/profile");
        }
      } catch (error) {
        console.error("Error adding property:", error.response?.data || error);
        // Add user-friendly error handling here
      }
    },
    [formData, files, authData.token, navigate]
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Adicionar Imóvel</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Imóvel
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Selecione o tipo</option>
              {Object.values(propertyTypes).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Condição
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Selecione a condição</option>
              {formData.type === propertyTypes.LAND
                ? propertyConditions.LAND.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))
                : propertyConditions.HOUSEANDAPARTMENT.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rua
            </label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamanho (m²)
            </label>
            <input
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {(formData.type === propertyTypes.HOUSE ||
            formData.type === propertyTypes.APARTMENT) && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quartos
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  max="99"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Casas de Banho
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  max="99"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Andares
                </label>
                <input
                  type="number"
                  name="floors"
                  value={formData.floors}
                  onChange={handleChange}
                  min="0"
                  max="99"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tamanho da Garagem
                </label>
                <input
                  type="number"
                  name="garageSize"
                  value={formData.garageSize}
                  onChange={handleChange}
                  min="0"
                  max="99"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número da Porta
            </label>
            <input
              type="text"
              name="doorNumber"
              value={formData.doorNumber}
              onChange={(e) => {
                // Aceita apenas números e limita a 5 dígitos
                const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                setFormData((prev) => ({ ...prev, doorNumber: value }));
              }}
              maxLength={5}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Freguesia
            </label>
            <input
              type="text"
              name="parish"
              value={formData.parish}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              pattern="[0-9]+[.,][0-9]+"
              title="Por favor, insira um valor decimal usando vírgula ou ponto (ex: 100.00 ou 100,00)"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Selecione a localização no mapa
          </label>
          <GoogleMapComponent
            center={mapCenter}
            onClick={handleMapClick}
            selectedLocation={selectedLocation}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Coordenadas da Localização
          </label>
          <input
            type="text"
            name="mapLocation"
            value={formData.mapLocation}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Latitude,Longitude (ex: 41.366873,-8.194834)"
          />
          <p className="text-sm text-gray-600 mt-1">
            Clique no mapa para selecionar a localização exata ou insira as
            coordenadas manualmente
          </p>
        </div>

        {(formData.type === propertyTypes.HOUSE ||
          formData.type === propertyTypes.APARTMENT) && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Características
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.features.airConditioning}
                  onChange={() => handleFeatureChange("airConditioning")}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Ar Condicionado</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.features.builtInCabinets}
                  onChange={() => handleFeatureChange("builtInCabinets")}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">
                  Armários Embutidos
                </span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.features.elevator}
                  onChange={() => handleFeatureChange("elevator")}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Elevador</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.features.balcony}
                  onChange={() => handleFeatureChange("balcony")}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Varanda</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.features.garden}
                  onChange={() => handleFeatureChange("garden")}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Jardim</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.features.pool}
                  onChange={() => handleFeatureChange("pool")}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Piscina</span>
              </label>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fotos
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, "fotos")}
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#585959]-50 file:text-[#585959]-700 hover:file:bg-gray-300"
            />
            {files.fotos.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {files.fotos.length} arquivo(s) selecionado(s)
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.fotos.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md"
                    >
                      <span className="text-sm text-gray-500">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile("fotos", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vídeos
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, "videos")}
              accept="video/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#585959]-50 file:text-[#585959]-700 hover:file:bg-gray-300"
            />
            {files.videos.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {files.videos.length} arquivo(s) selecionado(s)
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.videos.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md"
                    >
                      <span className="text-sm text-gray-500">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile("videos", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plantas
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange(e, "plants")}
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#585959]-50 file:text-[#585959]-700 hover:file:bg-gray-300"
            />
            {files.plants.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {files.plants.length} arquivo(s) selecionado(s)
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.plants.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-md"
                    >
                      <span className="text-sm text-gray-500">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile("plants", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-[#585959] text-white py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Adicionar Imóvel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
