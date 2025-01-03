import { useNavigate } from 'react-router-dom';

const SearchHandler = ({ searchQuery }) => {
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchQuery?.trim()) {
      const goToProperties = window.confirm("Não inseriu nenhum termo de pesquisa. Deseja ver todos os imóveis disponíveis?");
      if (goToProperties) {
        navigate('/real-estate');
      }
      return;
    }

    const searchText = searchQuery.toLowerCase().trim();
    const params = new URLSearchParams();

    // Tipos de propriedade
    const propertyTypes = {
      moradia: 'Moradia',
      apartamento: 'Apartamento',
      terreno: 'Terreno'
    };

    // Detectar tipo de propriedade
    Object.entries(propertyTypes).forEach(([key, value]) => {
      if (searchText.includes(key)) {
        params.append('type', value);
      }
    });

    // Detectar número de quartos (T0, T1, T2, etc.)
    const bedroomsMatch = searchText.match(/t(\d+)/i);
    if (bedroomsMatch) {
      params.append('bedrooms', bedroomsMatch[1]);
    }

    // Características da propriedade
    const features = [
      { terms: [/piscina/i, /pool/i], key: 'pool' },
      { terms: [/jardim/i, /garden/i], key: 'garden' },
      { terms: [/varanda/i, /balcony/i], key: 'balcony' },
      { terms: [/elevador/i, /elevator/i], key: 'elevator' },
      { terms: [/ar\s*condicionado/i, /ac/i, /air/i], key: 'airConditioning' },
      { terms: [/armarios/i, /built\s*in/i], key: 'builtInCabinets' }
    ];

    const matchedFeatures = features
      .filter(feature => feature.terms.some(term => term.test(searchText)))
      .map(feature => feature.key);

    if (matchedFeatures.length > 0) {
      params.append('features', matchedFeatures.join(','));
    }

    // Detectar faixa de preço
    const priceMatch = searchText.match(/(\d+)\s*[k€]|\b(\d+)\s*mil|\b(\d+)\s*euro/i);
    if (priceMatch) {
      const price = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]);
      if (price) {
        // Se o preço for especificado em K (mil), multiplicar por 1000
        const finalPrice = searchText.includes('k') || searchText.includes('mil') 
          ? price * 1000 
          : price;
        params.append('maxPrice', finalPrice.toString());
      }
    }

    // Detectar área/tamanho
    const sizeMatch = searchText.match(/(\d+)\s*m2|\b(\d+)\s*metros/i);
    if (sizeMatch) {
      const size = parseInt(sizeMatch[1] || sizeMatch[2]);
      if (size) {
        params.append('minSize', size.toString());
      }
    }

    // Detectar localização (cidade/freguesia)
    const locations = searchText
      .replace(/t\d+/gi, '')
      .replace(/\d+\s*[k€]/g, '')
      .replace(/\d+\s*m2/g, '')
      .replace(/piscina|jardim|varanda|elevador|ar\s*condicionado|armarios/gi, '')
      .replace(/moradia|apartamento|terreno/gi, '')
      .trim();

    if (locations) {
      params.append('location', locations);
    }

    // Estado do imóvel
    const conditions = {
      nova: 'Nova Construção',
      renovada: 'Recentemente Renovada',
      antiga: 'Construção Antiga',
      agricola: 'Agrícola',
      urbano: 'Urbano',
      rural: 'Rural'
    };

    Object.entries(conditions).forEach(([key, value]) => {
      if (searchText.includes(key)) {
        params.append('condition', value);
      }
    });

    // Se não houver parâmetros específicos mas houver texto de pesquisa,
    // usar como pesquisa geral
    if (params.toString() === '' && searchText) {
      params.append('search', searchText);
    }

    navigate(`/real-estate?${params.toString()}`);
  };

  return { handleSearch };
};

export default SearchHandler;
