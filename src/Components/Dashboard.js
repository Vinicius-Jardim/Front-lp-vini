import React, { useEffect, useState } from "react";
import api from "../api";
import {
  FaUsers,
  FaBuilding,
  FaUserTie,
  FaUserShield,
  FaUserFriends,
} from "react-icons/fa";

const Dashboard = ({ token }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await api.get("/admins/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Erro ao carregar dados do dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <p>Carregando dados do Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        <p>{error}</p>
      </div>
    );
  }

  // Renderização de dados do dashboard com ícones
  const renderDashboardCard = (icon, label, value) => (
    <div className="bg-[#f4f5f5] rounded-lg shadow-lg p-3 flex items-center space-x-3">
      {" "}
      <div className="bg-gray-100 p-2 rounded-full">{icon}</div>
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="text-base font-bold">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="mt-6 w-full max-w-[90%] bg-[#f4f5f5] p-4  relative">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Dashboard</h2>
      {dashboardData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {renderDashboardCard(
            <FaUsers className="text-gray-500" size={16} />,
            "Total de Usuários",
            dashboardData.totalUsers || 0
          )}
          {renderDashboardCard(
            <FaBuilding className="text-gray-500" size={16} />, // Ícone de edifício para imóveis
            "Imóveis Listados",
            dashboardData.totalProperties || 0
          )}
          {renderDashboardCard(
            <FaUserTie className="text-gray-500" size={16} />, // Ícone de agente para agentes registrados
            "Agentes Registrados",
            dashboardData.totalAgentes || 0
          )}
          {renderDashboardCard(
            <FaUserFriends className="text-gray-500" size={16} />, // Ícone de amigos para clientes
            "Clientes Registrados",
            dashboardData.totalClientes || 0
          )}
          {renderDashboardCard(
            <FaUserShield className="text-gray-500" size={16} />, // Ícone de escudo para administradores
            "Administradores",
            dashboardData.totalAdmins || 0
          )}
        </div>
      ) : (
        <p className="text-gray-500">Nenhum dado disponível no momento.</p>
      )}
    </div>
  );
};

export default Dashboard;
