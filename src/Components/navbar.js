import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSearch,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import RegisterModal from "../Forms/Register";
import LoginModal from "../Forms/Login";
import ForgotPasswordModal from "../Forms/ForgotPassword";
import { useAuth } from "../Context/AuthContext";
import config from "../Config/Config";
import SearchHandler from "./SearchHandler";

const TwoNavbars = () => {
  const { authData, isLoading } = useAuth();
  const [scrolling, setScrolling] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const searchHandler = SearchHandler({ searchQuery });

  useEffect(() => {
    const handleScroll = () => {
      const shouldScroll = window.scrollY > 50;
      if (scrolling !== shouldScroll) {
        setScrolling(shouldScroll);
      }
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [scrolling]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSearchInputChange = (e) => setSearchQuery(e.target.value);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    searchHandler.handleSearch();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleNearbyProperties = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          navigate(`/nearby-properties?lat=${latitude}&lng=${longitude}`);
        },
        () =>
          alert(
            "Acesso à localização negado. Por favor, permita o acesso à sua localização para ver imóveis próximos."
          ),
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocalização não é suportada pelo seu navegador.");
    }
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    setIsForgotPasswordModalOpen(false);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    setIsForgotPasswordModalOpen(false);
  };

  const openForgotPasswordModal = () => {
    setIsForgotPasswordModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeRegisterModal = () => setIsRegisterModalOpen(false);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeForgotPasswordModal = () => setIsForgotPasswordModalOpen(false);

  const scrollToFooter = () => {
    const footer = document.getElementById("footer");
    if (footer) footer.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ fontFamily: "Glacial Indifference" }}>
      <div
        className={`fixed inset-x-0 top-0 w-full bg-[#f4f5f5] text-black p-4 z-30 ${
          scrolling ? "shadow-md" : ""
        }`}
        style={{ position: "fixed", width: "100%", left: 0, right: 0 }}
        ref={menuRef}
      >
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="pl-2 lg:pl-24">
            <img
              src="/logo.png"
              alt="Delight Real Estate"
              className="w-32 md:w-40 lg:w-48"
            />
          </Link>

          {/* User Info and Menu Button */}
          <div className="flex items-center space-x-4 pr-4 md:pr-8">
            <motion.div
              className="text-gray-800 font-semibold z-50 flex items-center"
              initial={{ opacity: 0 }}
              animate={{
                opacity: authData?.name || !authData?.token ? 1 : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              {authData.token ? (
                <div className="relative">
                  <Link
                    to={
                      authData?.role === "admin"
                        ? "/admin/profile"
                        : authData?.role === "agent"
                        ? "/agent/profile"
                        : "/user/profile"
                    }
                    className="flex items-center space-x-2"
                  >
                    {authData.image ? (
                      <img
                        src={`${config.API_URL}/${authData.image.replace(
                          /\\/g,
                          "/"
                        )}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "";
                          e.target.className = "hidden";
                        }}
                      />
                    ) : null}
                    <FaUserCircle
                      className={
                        authData.image ? "hidden" : "w-8 h-8 text-gray-600"
                      }
                    />
                    <span className="text-gray-600 hidden sm:inline">
                      {authData.name}
                    </span>
                  </Link>
                </div>
              ) : (
                <FaUserCircle
                  size={30}
                  className="text-gray-800 cursor-pointer"
                  onClick={openLoginModal}
                />
              )}
            </motion.div>
            <button onClick={toggleMenu} className="md:hidden">
              {isMenuOpen ? <FaTimes size={30} /> : <FaBars size={30} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="lg:hidden fixed inset-x-0 top-[64px] w-full bg-[#f4f5f5] shadow-lg z-50 max-h-[calc(100vh-64px)] overflow-y-auto"
            style={{ position: "fixed", width: "100%", left: 0, right: 0 }}
          >
            <div className="p-4 space-y-3 w-full max-w-none">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="O que procura?"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onKeyPress={handleKeyPress}
                  className="border-2 border-gray-300 bg-[#f4f5f5] rounded-full px-6 py-2 w-full focus:outline-none"
                />
                <FaSearch
                  onClick={handleSearchSubmit}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 cursor-pointer"
                  size={20}
                />
              </div>
              <button
                onClick={handleNearbyProperties}
                className="w-full bg-[#f4f5f5] border-2 border-gray-300 rounded-full px-6 py-2 flex items-center justify-center hover:bg-gray-200 transition-colors duration-300"
              >
                <FaMapMarkerAlt className="mr-2" size={20} />
                Casas perto de mim
              </button>
              <div className="flex flex-col space-y-1">
                <Link
                  to="/real-estate"
                  className="text-gray-800 hover:text-gray-600 px-3 py-2 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Imóveis
                </Link>
                <Link
                  to="/agents"
                  className="text-gray-800 hover:text-gray-600 px-3 py-2 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Agentes
                </Link>
                <button
                  onClick={() => {
                    scrollToFooter();
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-800 hover:text-gray-600 px-3 py-2 text-center"
                >
                  Contactos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navbar for desktop */}
      <motion.div
        className="fixed top-20 left-0 w-full bg-[#f4f5f5] text-black px-8 lg:px-32 py-4 flex items-center justify-between z-20 hidden lg:flex"
        initial={{ y: 0 }}
        animate={{ y: scrolling ? -75 : 0 }}
        transition={{ type: "spring", stiffness: 30 }}
      >
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="O que procura?"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleKeyPress}
            className="border-2 border-gray-300 bg-[#f4f5f5] rounded-full px-6 py-3 w-full focus:outline-none"
          />
          <FaSearch
            onClick={handleSearchSubmit}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-600 cursor-pointer"
            size={24}
          />
        </div>
        <button
          onClick={handleNearbyProperties}
          className="bg-[#f4f5f5] border-2 border-gray-300 rounded-full px-6 py-3 flex items-center hover:bg-gray-200 transition-colors duration-300"
        >
          <FaMapMarkerAlt className="mr-2" size={24} />
          Casas perto de mim
        </button>
        <div className="flex space-x-6 items-center">
          <Link
            to="/real-estate"
            className="text-gray-800 hover:text-gray-600 px-3 py-2"
          >
            Imóveis
          </Link>
          <span className="text-black">|</span>
          <Link
            to="/agents"
            className="text-gray-800 hover:text-gray-600 px-3 py-2"
          >
            Agentes
          </Link>
          <span className="text-black">|</span>
          <button
            onClick={scrollToFooter}
            className="text-gray-800 hover:text-gray-600 px-3 py-2"
          >
            Contactos
          </button>
        </div>
      </motion.div>

      {/* Modals */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeRegisterModal}
        openLoginModal={openLoginModal}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        openRegisterModal={openRegisterModal}
        openForgotPasswordModal={openForgotPasswordModal}
      />
      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={closeForgotPasswordModal}
      />
    </div>
  );
};

export default TwoNavbars;
