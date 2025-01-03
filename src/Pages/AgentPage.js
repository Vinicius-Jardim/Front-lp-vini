import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import config from "../Config/Config";
import Footer from "../Components/Footer";
import Property from "../Components/Property";
import { FaEnvelope, FaComment } from "react-icons/fa";
import ChatWindow from "../Components/Chat/ChatWindow";
import { useAuth } from "../Context/AuthContext";

const AgentPage = () => {
  const { id } = useParams();
  const [agent, setAgent] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const ws = useRef(null);
  const { authData } = useAuth();

  useEffect(() => {
    const fetchAgentAndProperties = async () => {
      try {
        const agentResponse = await api.get(`/users/user-by-id/${id}`);

        const agentData = {
          ...agentResponse.data,
          _id: agentResponse.data._id || agentResponse.data.id || id,
        };

        setAgent(agentData);

        const propertiesResponse = await api.get(`/properties/agent/${id}`);

        if (Array.isArray(propertiesResponse.data)) {
          setProperties(propertiesResponse.data);
        } else {
          setProperties([]);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error loading agent or properties.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentAndProperties();
  }, [id]);

  useEffect(() => {
    if (!showChat) return;

    const wsUrl = `${config.WS_URL}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      if (authData?.token) {
        ws.current.send(
          JSON.stringify({
            type: "auth",
            token: authData.token,
            userId: authData.id,
          })
        );
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "typing_status" && data.senderId === id) {
          setIsTyping(data.isTyping);
        }
      } catch (error) {
        console.error("Erro ao processar mensagem WebSocket:", error);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [showChat, authData, id]);

  // Verificar se o usuário está tentando enviar mensagem para si mesmo
  const isSelfChat = authData?.id === agent?._id;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
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
        {/* Agent Profile Header */}
        <div
          className="bg-[#f4f5f5] p-6 flex items-center space-x-6 w-full max-w-[90%]"
          style={{ fontFamily: "Glacial Indifference" }}
        >
          {/* Profile Picture */}
          {agent?.image && (
            <img
              src={`${config.API_URL}/${agent.image}`}
              className="w-28 h-36 object-cover mb-3 rounded"
              alt="Agent"
            />
          )}
          {/* User Info */}
          <div className="flex-grow">
            <h2 className="text-xl font-bold text-gray-800">
              {agent?.name || "Unknown Agent"}
            </h2>
            <p className="text-gray-600">
              {agent?.email || "Email not available"}
            </p>
            <p className="text-gray-600">
              {agent?.phone || "Phone not available"}
            </p>

            {/* Botões de contato */}
            <div className="mt-4 flex gap-3">
              {!isSelfChat && (
                <>
                  <button
                    onClick={() =>
                      (window.location.href = `mailto:${agent?.email}`)
                    }
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full text-sm flex items-center gap-2"
                  >
                    <FaEnvelope size={14} />
                    Email
                  </button>

                  <button
                    onClick={() => setShowChat(true)}
                    className="bg-[#585959] hover:bg-gray-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"
                  >
                    <FaComment size={14} />
                    Chat
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Properties Section */}
        <div className="mt-8 w-full max-w-[90%]">
          <h3
            className="text-xl font-bold text-gray-800 mb-4"
            style={{ fontFamily: "Glacial Indifference" }}
          >
            Propriedades Listadas por {agent?.name}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.isArray(properties) && properties.length > 0 ? (
              properties.map((property) => (
                <Property key={property._id} house={property} />
              ))
            ) : (
              <p className="text-gray-600 text-center w-full">
                Este agente não tem propriedades listadas.
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Chat Window */}
      {showChat && !isSelfChat && (
        <ChatWindow
          recipientId={agent?._id}
          recipientName={agent?.name}
          isFloating={true}
          onClose={() => setShowChat(false)}
          ws={ws.current}
          isConnected={isConnected}
          isTyping={isTyping}
          onNewMessage={(recipientId, message) => {
            // Opcional: Adicionar lógica para lidar com novas mensagens
          }}
        />
      )}
    </>
  );
};

export default AgentPage;
