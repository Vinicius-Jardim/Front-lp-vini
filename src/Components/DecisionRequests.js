import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { toast } from "react-toastify";
import config from "../Config/Config";
import { FaCheck, FaTimes } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

const DecisionRequests = () => {
  const { authData } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.API_URL}/api/licenses/promotions-requests`,
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
          params: {
            page: currentPage + 1,
            limit: ITEMS_PER_PAGE,
          },
        }
      );

      const {
        requests: responseRequests,
        totalPages,
        totalRequests,
      } = response.data;

      if (Array.isArray(responseRequests)) {
        setRequests(responseRequests);
        setTotalPages(totalPages);
      } else {
        setRequests([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Erro ao carregar as solicitações");
      setRequests([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [authData.token, currentPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const api = axios.create({
    baseURL: config.API_URL,
    headers: {
      Authorization: `Bearer ${authData.token}`,
    },
  });

  const handleDecision = async (id, decision) => {
    const endpoint = `${config.API_URL}/api/licenses/promotions-requests/decision/${id}`;
    const decisionPayload = {
      decision: decision === "approved" ? "accept" : "reject",
    };

    try {
      await axios.put(endpoint, decisionPayload, {
        headers: {
          Authorization: `Bearer ${authData.token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success(
        `Solicitação ${
          decision === "approved" ? "aprovada" : "rejeitada"
        } com sucesso`
      );
      fetchRequests();
    } catch (error) {
      console.error("Error making decision:", error.response?.data || error);
      const errorMessage =
        error.response?.data?.error || "Erro ao processar a decisão";
      toast.error(errorMessage);
      console.log("Request payload:", decisionPayload);
      console.log("Endpoint:", endpoint);
    }
  };

  const handleApprove = (id) => handleDecision(id, "approved");
  const handleReject = (id) => handleDecision(id, "rejected");

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f5f5] rounded-lg shadow">
      <div className="p-6 border-b border-[#585959]">
        <h2 className="text-xl font-semibold text-[#585959]">
          Solicitações de Promoção
        </h2>
      </div>

      <div className="border border-[#585959] rounded-lg mx-4 my-4">
        <div className="flex flex-col">
          {requests.map((request, index) => (
            <div key={request._id}>
              <div className="p-4 hover:bg-gray-100 flex justify-between items-center">
                <div className="flex-1 flex justify-between items-center">
                  <div className="flex flex-col space-y-2">
                    <p className="text-base font-semibold text-[#585959]">
                      {request.emailAddress}
                    </p>
                    <p className="text-sm text-[#585959]">
                      {request.agentLicense}
                    </p>
                    <p className="text-sm text-[#585959]">{request.employer}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-[#585959]">
                      {request.status}
                    </span>
                    {request.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(request._id)}
                          className="inline-flex items-center px-3 py-1 border border-[#585959] text-sm font-medium rounded-md text-[#585959] bg-[#f4f5f5] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#585959]"
                        >
                          <FaCheck className="mr-2" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="inline-flex items-center px-3 py-1 border border-[#585959] text-sm font-medium rounded-md text-[#585959] bg-[#f4f5f5] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#585959]"
                        >
                          <FaTimes className="mr-2" />
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {index < requests.length - 1 && (
                <div className="flex justify-center">
                  <div className="w-[95%] border-b border-[#585959]"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#f4f5f5] px-4 py-3 flex items-center justify-center border-t border-[#585959] sm:px-6">
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
    </div>
  );
};

export default DecisionRequests;
