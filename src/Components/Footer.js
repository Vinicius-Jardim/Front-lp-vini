import React from 'react';
import { FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer id="footer" className="bg-[#585959] text-white px-4 py-8 sm:px-6 lg:px-8" style={{fontFamily: 'Glacial Indifference'}}>
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          {/* Esquerda: Informações de Contato */}
          <div className="text-center lg:text-left w-full lg:w-1/2 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Tem alguma dúvida? <br className="hidden lg:block" /> Contacte-nos.
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-300">Telemóvel</p>
                <p className="text-lg">(123) 456-7890</p>
              </div>
              
              <div>
                <p className="text-gray-300">Email</p>
                <p className="text-lg">suporte@delightre.com</p>
              </div>
              
              <div>
                <p className="text-gray-300 mb-2">Social</p>
                <div className="flex justify-center lg:justify-start space-x-6">
                  <a href="#" aria-label="Twitter" className="transform hover:scale-110 transition-transform duration-200">
                    <FaTwitter size={28} className="text-white hover:text-gray-300" />
                  </a>
                  <a href="#" aria-label="Instagram" className="transform hover:scale-110 transition-transform duration-200">
                    <FaInstagram size={28} className="text-white hover:text-gray-300" />
                  </a>
                  <a href="mailto:suporte@delightre.com" aria-label="Email" className="transform hover:scale-110 transition-transform duration-200">
                    <FaEnvelope size={28} className="text-white hover:text-gray-300" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Direita: Logo */}
          <div className="flex flex-col items-center lg:items-end w-full lg:w-1/2 space-y-2">
            <h3 className="text-4xl sm:text-5xl font-bold">DELIGHT</h3>
            <p className="text-lg sm:text-xl tracking-widest">REAL ESTATE</p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center mt-8 pt-8 border-t border-gray-600 text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} Delight Real Estate. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
