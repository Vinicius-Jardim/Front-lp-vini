import React from 'react';
import AddRecently from '../Components/AddRecently';
import Footer from '../Components/Footer';

const Home = () => {
  return (
    <div className="relative w-full"  style={{fontFamily: 'Glacial Indifference'}}>
      {/* Imagem de fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center h-screen"
        style={{
            backgroundImage: 'url(/homepage.jpg)',
        }}
      ></div>

      {/* Sobreposição de cor para escurecer a imagem */}
      <div className="absolute inset-0 bg-black opacity-30 h-screen"></div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-center h-screen text-white text-center px-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold max-w-3xl mx-auto">Bem-vindo ao Delight Real Estate</h1>
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">Encontre a casa dos seus sonhos</p>
      </div>

      {/* Componentes adicionais (fora do contêiner da imagem de fundo) */}
      <div className="relative z-10 p-8 mx-auto bg-[#f4f5f5]">
        <AddRecently />
      </div>

      <Footer />
    </div>
  );
};

export default Home;
