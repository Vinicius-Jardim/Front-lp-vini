import React, { useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "../Context/AuthContext";
import { FaTimes, FaTrash, FaSearch } from "react-icons/fa";

const UserList = () => {
  const { authData } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showList, setShowList] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [roleSelected, setRoleSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    userId: null,
    userName: "",
  });
  const usersPerPage = 5;

  const fetchUsers = async (role, page = 1, limit = 10000) => {
    if (!authData?.token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(
        `/admins/all?role=${role}&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      );
      setUsersList(response.data.payload || []);
      setFilteredUsers(response.data.payload || []);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setError("Falha ao carregar usuários. Por favor, tente novamente.");
      setUsersList([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const search = event.target.value.toLowerCase();
    setSearchTerm(search);
    const filtered = usersList.filter(
      (user) =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
    );
    setFilteredUsers(filtered);
  };

  const handleShowList = (role) => {
    fetchUsers(role);
    setRoleSelected(role);
    setShowList(true);
  };

  const handleCloseList = () => {
    setShowList(false);
    setUsersList([]);
    setFilteredUsers([]);
    setRoleSelected(null);
    setSearchTerm("");
  };

  const handleDeleteUser = async (userId) => {
    if (!authData?.token) return;
    try {
      await api.delete(`admins/delete-user/${userId}`, {
        headers: { Authorization: `Bearer ${authData.token}` },
      });
      setUsersList(usersList.filter((user) => user._id !== userId));
      setFilteredUsers(filteredUsers.filter((user) => user._id !== userId));
      setConfirmDelete({ show: false, userId: null, userName: "" });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      setError("Falha ao excluir usuário. Por favor, tente novamente.");
    }
  };

  const confirmDeleteUser = (userId, userName) => {
    setConfirmDelete({ show: true, userId, userName });
  };

  const cancelDelete = () => {
    setConfirmDelete({ show: false, userId: null, userName: "" });
  };

  const indexOfLastUser = (currentPage + 1) * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    return () => {
      setUsersList([]);
      setFilteredUsers([]);
      setShowList(false);
      setRoleSelected(null);
    };
  }, []);

  if (loading) {
    return <div>Carregando usuários...</div>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="mt-6 w-full max-w-[90%] bg-[#f4f5f5] p-4 rounded-lg border shadow relative">
      <div className="p-1 border-b border-[#585959] mb-2">
        <h2 className="text-xl font-semibold text-[#585959]">
          Lista de Usuários
        </h2>

        <div className="flex flex-row space-x-4 mb-1">
          <button
            className={`relative inline-flex items-center px-2 py-1 border border-[#585959] text-sm font-medium rounded-md ${
              roleSelected === "client"
                ? "z-10 bg-[#585959] text-[#f4f5f5]"
                : "text-[#585959] bg-[#f4f5f5] hover:bg-gray-100"
            }`}
            onClick={() => handleShowList("client")}
          >
            Clientes
          </button>
          <button
            className={`relative inline-flex items-center px-2 py-1 border border-[#585959] text-sm font-medium rounded-md ${
              roleSelected === "agent"
                ? "z-10 bg-[#585959] text-[#f4f5f5]"
                : "text-[#585959] bg-[#f4f5f5] hover:bg-gray-100"
            }`}
            onClick={() => handleShowList("agent")}
          >
            Agentes
          </button>
          {showList && (
            <button
              className="absolute top-1 right-5 mt-2 mr-2  text-[#585959] rounded-full p-1 hover:bg-[#585959]-700"
              onClick={handleCloseList}
            >
              <FaTimes size={20} />
            </button>
          )}
        </div>
      </div>

      {showList && (
        <div className="border border-[#585959] rounded-lg mx-1 my-1 p-6">
          <div className="relative">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Pesquisar usuários..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-3 py-2 pl-10 border-[#585959] rounded-lg bg-[#f4f5f5]"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#585959]-400" />
            </div>
            {currentUsers.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {currentUsers.map((user) => (
                  <li
                    key={user._id}
                    className="flex justify-between items-center p-2 border-b border-[#585959]"
                  >
                    <div className="flex-1">
                      <span className="block text-base font-semibold text-[#585959]">
                        {user.name}
                      </span>
                      <span className="block text-sm text-[#585959]">
                        {user.email}
                      </span>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => confirmDeleteUser(user._id, user.name)}
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 mt-4">Nenhum usuário encontrado.</p>
            )}
          </div>
        </div>
      )}

      {showList && filteredUsers.length > 0 && (
        <div className="bg-[#f4f5f5] px-4 py-3 flex items-center justify-center  sm:px-6">
          <div className="flex-1 flex justify-center sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center px-4 py-2 border border-[#585959] text-sm font-medium rounded-md text-[#585959] bg-[#f4f5f5] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#585959] text-sm font-medium rounded-md text-[#585959] bg-[#f4f5f5] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
          <div className="hidden sm:block">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#585959] text-sm font-medium text-[#585959] bg-[#f4f5f5] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`relative inline-flex items-center px-4 py-2 border border-[#585959] text-sm font-medium ${
                    currentPage === index
                      ? "z-10 bg-[#585959] text-[#f4f5f5]"
                      : "text-[#585959] bg-[#f4f5f5] hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#585959] text-sm font-medium text-[#585959] bg-[#f4f5f5] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </nav>
          </div>
        </div>
      )}

      {confirmDelete.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h4 className="text-lg font-semibold">Confirmar Eliminação</h4>
            <p>
              Você tem certeza que deseja eliminar o usuário{" "}
              {confirmDelete.userName}?
            </p>
            <div className="flex justify-end mt-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => handleDeleteUser(confirmDelete.userId)}
              >
                Confirmar
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={cancelDelete}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
