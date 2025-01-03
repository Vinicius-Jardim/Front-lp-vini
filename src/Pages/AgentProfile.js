import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCog, FaPlus, FaSignOutAlt } from "react-icons/fa";
import api from "../api";
import config from "../Config/Config";
import Footer from "../Components/Footer";
import Property from "../Components/Property";
import ProfileSettings from "../Components/ProfileSettings";
import ChatList from "../Components/Chat/ChatList";

const AgentProfile = () => {
  const { authData, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        console.log("Fetching agent data...");
        if (authData.token) {
          const userResponse = await api.get("/users/me", {
            headers: { Authorization: `Bearer ${authData.token}` },
          });
          console.log("User data received:", userResponse.data);
          setUserInfo(userResponse.data);

          const propertiesResponse = await api.get("/agents/own-properties", {
            headers: { Authorization: `Bearer ${authData.token}` },
          });
          console.log("Properties data received:", propertiesResponse.data);
          setProperties(propertiesResponse.data);
        }
      } catch (error) {
        console.error("Error fetching agent data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [authData.token]);

  useEffect(() => {
    console.log("UserInfo updated:", userInfo);
  }, [userInfo]);

  useEffect(() => {
    console.log("Properties updated:", properties);
  }, [properties]);

  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    navigate("/");
  };

  const handleAddProperty = () => {
    console.log("Navigating to add property...");
    navigate("/add-property");
  };

  const handleDeleteProperty = (propertyId) => {
    console.log("Deleting property:", propertyId);
    setProperties(properties.filter((p) => p._id !== propertyId));
  };

  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
  };

  const handleSaveChanges = async (updatedUserInfo) => {
    setUserInfo((prevInfo) => ({
      ...prevInfo,
      ...updatedUserInfo,
    }));
    navigate("/agent/profile");
  };

  if (loading) {
    console.log("AgentProfile is loading...");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    console.log("AgentProfile encountered error:", error);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-center px-4">{error}</p>
      </div>
    );
  }

  console.log("AgentProfile rendering with userInfo:", userInfo);

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-100"
      style={{ fontFamily: "Glacial Indifference" }}
    >
      <div className="flex-grow container mx-auto px-4 pt-[120px] sm:pt-[175px] pb-8">
        {/* Agent Profile Header */}
        <div className="bg-[#f4f5f5] p-4 sm:p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="shrink-0">
              {userInfo?.image ? (
                <img
                  src={`${config.API_URL}/${userInfo.image}`}
                  className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded shadow-sm"
                  alt="Agent"
                />
              ) : (
                <div className="w-24 h-32 sm:w-28 sm:h-36 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            {/* User Info and Actions */}
            <div className="flex-grow text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {userInfo?.name || "Agente Desconhecido"}
              </h2>
              <p className="text-gray-600 mb-4">
                {userInfo?.email || "Email não disponível"}
              </p>

              {/* Action Buttons - Mobile */}
              <div className="flex flex-col gap-3 sm:hidden">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold w-full"
                >
                  Logout
                </button>
                <button
                  onClick={handleAddProperty}
                  className="bg-[#f4f5f5] border border-solid border-[1.5px] border-[#585959] text-[#585959] px-6 py-2 rounded-full text-sm font-semibold w-full flex items-center justify-center gap-2"
                >
                  <FaPlus size={14} />
                  Adicionar Imóvel
                </button>
              </div>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden sm:flex items-center gap-4">
              <button
                onClick={handleAddProperty}
                className="bg-[#f4f5f5] hover:bg-gray-200 border border-solid border-[1.5px] border-[#585959] text-[#585959] px-6 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <FaPlus size={14} />
                Adicionar Imóvel
              </button>

              <FaCog
                size={24}
                className="text-gray-600 cursor-pointer"
                onClick={handleOpenSettings}
              />

              {/* Ícone de Logout */}
              <FaSignOutAlt
                size={24}
                className="text-gray-600 cursor-pointer"
                onClick={handleLogout}
              />
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="container mx-auto px-4 mb-8">
          <div className="bg-[#f4f5f5] rounded-lg shadow-sm p-6 border border-[#585959]">
            <ChatList />
          </div>
        </div>

        {/* Property Listings */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Meus Imóveis</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {properties.length > 0 ? (
            properties.map((property) => (
              <Property
                key={property._id}
                house={property}
                onDelete={handleDeleteProperty}
                isAgentProperty={true}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">Nenhum imóvel encontrado.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {/* Mostrar o modal apenas se showSettingsModal for true */}
      {showSettingsModal && (
        <ProfileSettings
          userInfo={userInfo}
          onSaveChanges={handleSaveChanges}
          onClose={handleCloseSettings}
        />
      )}
    </div>
  );
};

export default AgentProfile;
