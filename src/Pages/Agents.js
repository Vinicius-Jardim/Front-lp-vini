import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import config from "../Config/Config";
import Footer from "../Components/Footer";

const agencyLogos = [
  { name: "Remax", logo: "remax.png" },
  { name: "ERA", logo: "era.png" },
  { name: "Century 21", logo: "century21.png" },
  { name: "ZOME", logo: "zome.png" },
];

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAgency, setSelectedAgency] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const url = selectedAgency
          ? `/users/agents-by-enterprise?agency=${selectedAgency}&page=${page}&limit=12`
          : `/users/get-all-agents?page=${page}&limit=12`;
        const response = await api.get(url);
        setAgents(response.data.agents || response.data.agentData);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [page, selectedAgency]);

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <>
      <div
        className="flex flex-col items-center bg-gray-100 min-h-screen pt-40"
        style={{ fontFamily: "Glacial Indifference" }}
      >
        <div className="flex flex-wrap justify-center gap-4 py-6">
          {agencyLogos.map((agency, index) => (
            <button
              key={index}
              className={`flex items-center justify-center rounded-lg p-5 w-40 h-16 border ${
                selectedAgency === agency.name
                  ? "bg-gray-200 border-blue-500"
                  : "bg-[#f4f5f5] border-black"
              }`}
              onClick={() => {
                setSelectedAgency(
                  selectedAgency === agency.name ? null : agency.name
                );
                setPage(1);
              }}
            >
              <img
                src={agency.logo}
                alt={`${agency.name} Logo`}
                className="w-20 object-contain"
              />
            </button>
          ))}
        </div>

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-w-6xl w-full">
            {agents && agents.length > 0 ? (
              agents.map((agent, index) => (
                <Link
                  key={index}
                  to={`/agent/${agent._id}`}
                  className="flex flex-col items-center bg-[#f4f5f5] rounded-md p-4 hover:shadow-lg transition-shadow duration-300"
                >
                  {agent.image ? (
                    <img
                      src={`${config.API_URL}/${agent.image}`}
                      className="w-28 h-36 object-cover mb-3 rounded"
                      alt={`${agent.name}`}
                    />
                  ) : (
                    <div className="w-28 h-36 bg-gray-200 flex items-center justify-center mb-3 rounded">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="text-center">
                    <h4 className="font-bold text-lg">{agent.name}</h4>
                    <p className="text-gray-600 text-sm">{agent.email}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-lg text-gray-600">
                  Sem agentes disponívies para esta agência.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center items-center space-x-2 mt-6 mb-3">
          <button
            onClick={handlePreviousPage}
            disabled={page === 1}
            className="px-3 py-1 rounded hover:bg-gray-200"
          >
            &lt;
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 ${
                page === index + 1 ? "font-bold bg-gray-200" : ""
              } rounded hover:bg-gray-200`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className="px-3 py-1 rounded hover:bg-gray-200"
          >
            &gt;
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Agents;
