import React, { useState } from "react";
import { Range } from "react-range";

const PRICE_MIN = 10000;
const PRICE_MAX = 2000000;
const SIZE_MIN = 50;
const SIZE_MAX = 10000;

const featureLabels = [
  "Ar Condicionado",
  "Piscina",
  "Jardim",
  "Elevador",
  "Varanda",
];

const SideFilters = ({ onFilterChange }) => {
  const [priceValues, setPriceValues] = useState([PRICE_MIN, PRICE_MAX]);
  const [sizeValues, setSizeValues] = useState([SIZE_MIN, SIZE_MAX]);
  const [type, setType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [garageSize, setGarageSize] = useState("");
  const [floors, setFloors] = useState("");
  const [features, setFeatures] = useState({
    airConditioning: false,
    pool: false,
    garden: false,
    elevator: false,
    balcony: false,
  });

  const isFilterApplied = () =>
    priceValues[0] !== PRICE_MIN ||
    priceValues[1] !== PRICE_MAX ||
    sizeValues[0] !== SIZE_MIN ||
    sizeValues[1] !== SIZE_MAX ||
    type ||
    bedrooms ||
    bathrooms ||
    garageSize ||
    floors ||
    Object.values(features).some((value) => value);

  const handleClearFilters = () => {
    setPriceValues([PRICE_MIN, PRICE_MAX]);
    setSizeValues([SIZE_MIN, SIZE_MAX]);
    setType("");
    setBedrooms("");
    setBathrooms("");
    setGarageSize("");
    setFloors("");
    setFeatures({
      airConditioning: false,
      pool: false,
      garden: false,
      elevator: false,
      balcony: false,
    });

    // Atualizar o estado dos filtros e a URL
    const filterData = {
      minPrice: PRICE_MIN,
      maxPrice: PRICE_MAX,
      minSize: SIZE_MIN,
      maxSize: SIZE_MAX,
      type: null,
      bedrooms: null,
      bathrooms: null,
      garageSize: null,
      floors: null,
      features: "",
    };

    onFilterChange(filterData);

    // Limpar os parâmetros da URL
    const url = new URL(window.location);
    url.search = ""; // Remove todos os parâmetros de pesquisa
    window.history.replaceState(null, "", url);
  };

  const handleApplyFilters = () => {
    // Verificar o valor de garageSize antes de aplicar o filtro
    console.log("Garage Size:", garageSize); // Este log mostra o valor atual de garageSize

    const filterData = {
      minPrice: priceValues[0] !== PRICE_MIN ? priceValues[0] : null,
      maxPrice: priceValues[1] !== PRICE_MAX ? priceValues[1] : null,
      minSize: sizeValues[0] !== SIZE_MIN ? sizeValues[0] : null,
      maxSize: sizeValues[1] !== SIZE_MAX ? sizeValues[1] : null,
      type: type || null,
      bedrooms: bedrooms ? parseInt(bedrooms.replace("T", "")) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      garageSize: garageSize ? parseInt(garageSize) : null,
      floors: floors ? parseInt(floors) : null,
      features:
        Object.keys(features)
          .filter((key) => features[key])
          .join(",") || null,
    };

    // Remover filtros que não foram aplicados (valores `null`)
    Object.keys(filterData).forEach((key) => {
      if (filterData[key] === null) {
        delete filterData[key];
      }
    });

    onFilterChange(filterData);

    // Atualizar a URL apenas com os filtros aplicados
    const url = new URL(window.location);
    url.search = ""; // Limpar a URL primeiro
    Object.entries(filterData).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    window.history.replaceState(null, "", url);
  };

  return (
    <div className="p-4 font-sans">
      <h5 className="text-lg font-semibold mb-3">Tipo de imóvel</h5>
      <select
        className="w-full p-2 mb-4 rounded-full bg-[#f4f5f5] border border-gray-400"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="">Todos</option>
        <option>Moradia</option>
        <option>Apartamento</option>
        <option>Terreno</option>
      </select>

      <h5 className="text-lg font-semibold mb-3">Preço</h5>
      <div className="mb-4">
        <Range
          step={5000}
          min={PRICE_MIN}
          max={PRICE_MAX}
          values={priceValues}
          onChange={(values) => setPriceValues(values)}
          renderTrack={({ props, children }) => (
            <div {...props} className="h-1 w-full bg-gray-300 relative">
              <div
                className="absolute h-1 bg-gray-500"
                style={{
                  left: `${
                    ((priceValues[0] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) *
                    100
                  }%`,
                  right: `${
                    100 -
                    ((priceValues[1] - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) *
                      100
                  }%`,
                }}
              />
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div {...props} className="h-4 w-4 rounded-full bg-gray-500" />
          )}
        />
        <div className="flex justify-between text-gray-500 mt-2">
          <span>{priceValues[0].toLocaleString("pt-PT")}€</span>
          <span>{priceValues[1].toLocaleString("pt-PT")}€</span>
        </div>
      </div>

      <h5 className="text-lg font-semibold mb-3">Tamanho</h5>
      <div className="mb-4">
        <Range
          step={10}
          min={SIZE_MIN}
          max={SIZE_MAX}
          values={sizeValues}
          onChange={(values) => setSizeValues(values)}
          renderTrack={({ props, children }) => (
            <div {...props} className="h-1 w-full bg-gray-300 relative">
              <div
                className="absolute h-1 bg-gray-500"
                style={{
                  left: `${
                    ((sizeValues[0] - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100
                  }%`,
                  right: `${
                    100 -
                    ((sizeValues[1] - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100
                  }%`,
                }}
              />
              {children}
            </div>
          )}
          renderThumb={({ props }) => (
            <div {...props} className="h-4 w-4 rounded-full bg-gray-500" />
          )}
        />
        <div className="flex justify-between text-gray-500 mt-2">
          <span>{sizeValues[0].toLocaleString("pt-PT")} m²</span>
          <span>{sizeValues[1].toLocaleString("pt-PT")} m²</span>
        </div>
      </div>

      <h5 className="text-lg font-semibold mb-3">Quartos</h5>
      <select
        className="w-full p-2 mb-4 rounded-full bg-[#f4f5f5] border border-gray-400"
        value={bedrooms}
        onChange={(e) => setBedrooms(e.target.value)}
      >
        <option value="">Todos</option>
        <option>T0</option>
        <option>T1</option>
        <option>T2</option>
        <option>T3</option>
        <option>T4</option>
        <option>T5</option>
      </select>

      <h5 className="text-lg font-semibold mb-3">Casas de Banho</h5>
      <select
        className="w-full p-2 mb-4 rounded-full bg-[#f4f5f5] border border-gray-400"
        value={bathrooms}
        onChange={(e) => setBathrooms(e.target.value)}
      >
        <option value="">Todas</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
      </select>

      <h5 className="text-lg font-semibold mb-3">Garagem</h5>
      <select
        className="w-full p-2 mb-4 rounded-full bg-[#f4f5f5] border border-gray-400"
        value={garageSize}
        onChange={(e) => setGarageSize(e.target.value)}
      >
        <option value="">Todas</option>
        <option>0</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
      </select>

      <h5 className="text-lg font-semibold mb-3">Mais Filtros</h5>
      {Object.keys(features).map((feature, i) => (
        <div key={feature} className="mb-2">
          <input
            type="checkbox"
            id={feature}
            className="mr-2"
            checked={features[feature]}
            onChange={(e) =>
              setFeatures((prev) => ({
                ...prev,
                [feature]: e.target.checked,
              }))
            }
          />
          <label htmlFor={feature}>{featureLabels[i]}</label>
        </div>
      ))}

      <div className="flex flex-col gap-2 mt-6">
        <button
          onClick={handleApplyFilters}
          className="w-full bg-gray-500 text-white rounded-full py-2 hover:bg-gray-700"
        >
          Aplicar Filtros
        </button>
        <button
          onClick={handleClearFilters}
          disabled={!isFilterApplied()}
          className="w-full bg-gray-100 text-gray-700 border border-gray-500 rounded-full py-2 hover:bg-gray-500 hover:text-white"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
};

export default SideFilters;
