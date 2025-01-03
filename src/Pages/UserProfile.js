import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import api from "../api";
import Footer from "../Components/Footer";
import Wishlist from "../Components/Wishlist";
import PromotionRequest from "../Forms/PromotionRequest";
import ProfileSettings from "../Components/ProfileSettings";
import config from "../Config/Config";
import ChatList from "../Components/Chat/ChatList";

const UserProfile = () => {
  const { authData, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPromotionForm, setShowPromotionForm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const navigate = useNavigate();

  const handlePromotionClick = () => {
    setShowPromotionForm(true);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (authData?.token) {
        try {
          const response = await api.get("/users/me", {
            headers: { Authorization: `Bearer ${authData.token}` },
          });
          setUserInfo(response.data);
        } catch (error) {
          setError(
            "Falha ao carregar informações do usuário. Tente novamente."
          );
        }
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, [authData?.token]);

  const handleLogout = () => {
    logout();
    navigate("/");
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
    navigate("/user/profile");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100" style={{ fontFamily: "Glacial Indifference" }}>
      <div className="flex-grow container mx-auto px-4 pt-[120px] sm:pt-[175px] pb-8">
        {/* User Profile Header */}
        <div className="bg-[#f4f5f5] p-4 sm:p-6 rounded-lg shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Profile Picture */}
            <div className="shrink-0">
              {userInfo?.image ? (
                <img
                  src={`${config.API_URL}/${userInfo.image}`}
                  className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded shadow-sm"
                  alt="User"
                />
              ) : (
                <div className="w-24 h-32 sm:w-28 sm:h-36 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-grow text-center sm:text-left">
              {userInfo ? (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {userInfo.name || "Usuário"}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {userInfo.email || "Email não disponível"}
                  </p>
                </>
              ) : (
                <p className="text-gray-600">
                  Nenhuma informação do usuário disponível
                </p>
              )}

              {/* Action Buttons - Mobile */}
              <div className="flex flex-col gap-3 sm:hidden">
                <button
                  onClick={handlePromotionClick}
                  className="bg-[#f4f5f5] border border-solid border-[1.5px] border-[#585959] text-[#585959] px-6 py-2 rounded-full text-sm font-semibold w-full"
                >
                  É agente imobiliário?
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-6 py-2 rounded-full text-sm font-semibold w-full"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden sm:flex items-center gap-4">
              <button
                type="button"
                onClick={handlePromotionClick}
                className="bg-[#f4f5f5] hover:bg-gray-200 border border-solid border-[1.5px] border-[#585959] text-[#585959] px-6 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                É agente imobiliário?
              </button>

              <FaCog
                size={24}
                className="text-gray-600 cursor-pointer"
                onClick={handleOpenSettings}
              />

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

        {/* Wishlist Section */}
        <div className="w-full">
          <Wishlist />
        </div>
      </div>

      <Footer />

      {/* Modals */}
      {showPromotionForm && (
        <PromotionRequest onClose={() => setShowPromotionForm(false)} />
      )}
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

export default UserProfile;
