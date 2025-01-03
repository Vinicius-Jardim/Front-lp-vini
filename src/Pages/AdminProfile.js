import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Footer from "../Components/Footer";
import UserList from "../Components/UserList";
import ProfileSettings from "../Components/ProfileSettings";
import DecisionRequests from "../Components/DecisionRequests";
import AdminRegister from "../Forms/AdminRegister";
import Dashboard from "../Components/Dashboard";
import config from "../Config/Config";

const AdminProfile = () => {
  const { authData, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAdminRegisterModal, setShowAdminRegisterModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!authData?.token) return;

      setLoading(true);
      try {
        const response = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${authData.token}` },
        });
        setUserInfo(response.data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
        setError("Failed to load user information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [authData?.token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleOpenSettings = () => setShowSettingsModal(true);

  const handleCloseSettings = () => setShowSettingsModal(false);

  const handleSaveChanges = async (updatedUserInfo) => {
    setUserInfo((prevInfo) => ({ ...prevInfo, ...updatedUserInfo }));
    navigate("/admin/profile");
  };

  const handleCreateAdmin = () => setShowAdminRegisterModal(true);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
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
    <>
      <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen pt-[175px]">
        <div className="bg-[#f4f5f5] p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-[90%] rounded-lg">
          {/* Profile Picture */}
          <div className="shrink-0">
            {userInfo?.image ? (
              <img
                src={`${config.API_URL}/${userInfo.image}`}
                alt="Agent"
                className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded shadow-sm"
              />
            ) : (
              <div className="w-24 h-32 sm:w-28 sm:h-36 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-grow">
            {userInfo ? (
              <>
                <h2 className="text-xl font-bold text-gray-800">
                  {userInfo.name || "Usuário Desconhecido"}
                </h2>
                <p className="text-gray-600">
                  {userInfo.email || "Email não disponível"}
                </p>
              </>
            ) : (
              <p className="text-gray-600">
                Nenhuma informação do usuário disponível
              </p>
            )}
          </div>

          {/* Button Novo Administrador */}
          <button
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full text-sm border border-solid border-[1.5px] border-[#585959] w-full sm:w-[200px]"
            onClick={handleCreateAdmin}
          >
            Novo Administrador
          </button>

          {/* Settings Icon */}
          <FaCog
            size={24}
            className="text-gray-600 cursor-pointer"
            onClick={handleOpenSettings}
          />

          {/* Logout Icon */}
          <FaSignOutAlt
            size={24}
            className="text-gray-600 cursor-pointer"
            onClick={handleLogout}
          />
        </div>

        {/* Dashboard Component */}
        <Dashboard token={authData.token} />

        {/* Render the UserList Component*/}
        <UserList />

        {/* Render the DecisionRequests Component */}
        <div className="w-full max-w-[90%] mt-8">
          <DecisionRequests />
        </div>
      </div>
      <Footer />

      {/* Modals */}
      {showSettingsModal && (
        <ProfileSettings
          userInfo={userInfo}
          onSaveChanges={handleSaveChanges}
          onClose={handleCloseSettings}
        />
      )}
      {showAdminRegisterModal && (
        <AdminRegister
          isOpen={showAdminRegisterModal}
          onClose={() => setShowAdminRegisterModal(false)}
        />
      )}
    </>
  );
};

export default AdminProfile;
