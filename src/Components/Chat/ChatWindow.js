import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
import api from "../../api";
import { FaTimes, FaTrash } from "react-icons/fa";
import config from "../../Config/Config";
import { BsThreeDots } from "react-icons/bs";

const ChatWindow = ({
  recipientId,
  recipientName,
  onClose,
  isFloating = false,
  onNewMessage,
  ws,
  isConnected,
  isTyping,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { authData } = useAuth();
  const userId = authData?.id;
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [deletingMessage, setDeletingMessage] = useState(false);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  // Carregar histórico de mensagens
  const fetchMessages = async () => {
    if (!userId) {
      console.error("ID do usuário não encontrado ao carregar mensagens");
      return;
    }

    try {
      const response = await api.get(`/messages/history/${recipientId}`);
      const formattedMessages = response.data.map((msg) => ({
        _id: msg._id,
        senderId: msg.senderId._id,
        senderName: msg.senderId.name,
        recipientId: msg.recipientId._id,
        content: msg.content,
        timestamp: msg.timestamp,
        read: msg.read || false,
        deleted: msg.deleted || false,
      }));

      setMessages(formattedMessages);
      setLoading(false);
      scrollToBottom();

      // Marcar mensagens não lidas como lidas
      const unreadMessageIds = formattedMessages
        .filter((msg) => !msg.read && msg.senderId === recipientId)
        .map((msg) => msg._id);

      if (unreadMessageIds.length > 0) {
        await markMessagesAsRead(unreadMessageIds);
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
      setError("Erro ao carregar mensagens");
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected || !userId) return;

    try {
      // Limpar o status de digitação antes de enviar
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (ws?.readyState === 1) {
        ws.send(
          JSON.stringify({
            type: "typing_status",
            recipientId: recipientId,
            senderId: userId,
            isTyping: false,
          })
        );
      }

      const response = await api.post("/messages/send", {
        recipientId: recipientId,
        content: newMessage.trim(),
        senderId: userId,
      });

      if (!response.data || !response.data._id) {
        throw new Error("Resposta inválida do servidor");
      }

      const newMsg = {
        _id: response.data._id,
        senderId: userId,
        recipientId: recipientId,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");
      scrollToBottom();

      if (onNewMessage) {
        onNewMessage(recipientId, newMsg);
      }

      // Enviar mensagem via WebSocket apenas após confirmação do servidor
      if (ws?.readyState === 1) {
        ws.send(
          JSON.stringify({
            type: "message",
            messageId: newMsg._id,
            senderId: userId,
            recipientId: recipientId,
            content: newMsg.content,
          })
        );
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setError("Erro ao enviar mensagem. Tente novamente.");
    }
  };

  // Atualizar o handler do input
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Evitar enviar status de digitação se não houver conexão WebSocket
    if (!ws?.readyState === 1 || !userId) return;

    const isCurrentlyTyping = e.target.value.trim().length > 0;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isCurrentlyTyping && ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "typing_status",
          recipientId: recipientId,
          senderId: userId,
          isTyping: true,
        })
      );
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (ws?.readyState === 1) {
        ws.send(
          JSON.stringify({
            type: "typing_status",
            recipientId: recipientId,
            senderId: userId,
            isTyping: false,
          })
        );
      }
    }, 1000);
  };

  useEffect(() => {
    if (recipientId && userId) {
      fetchMessages();
    }
  }, [recipientId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (ws?.readyState === 1) {
        ws.send(
          JSON.stringify({
            type: "typing_status",
            recipientId: recipientId,
            senderId: userId,
            isTyping: false,
          })
        );
      }
    };
  }, [recipientId, userId, ws]);

  // Função para marcar mensagens como lidas
  const markMessagesAsRead = async (messageIds = null) => {
    try {
      const idsToMark =
        messageIds ||
        messages
          .filter((msg) => !msg.read && msg.senderId === recipientId)
          .map((msg) => msg._id)
          .filter((id) => /^[0-9a-fA-F]{24}$/.test(id));

      if (idsToMark.length === 0) {
        console.log("Nenhuma mensagem válida para marcar como lida");
        return;
      }

      console.log("Marcando mensagens como lidas:", idsToMark);

      const response = await api.post("/messages/mark-read", {
        messageIds: idsToMark,
      });

      if (response.data.success) {
        // Notificar o remetente via WebSocket
        if (ws?.readyState === 1) {
          ws.send(
            JSON.stringify({
              type: "messages_read",
              senderId: userId,
              recipientId: recipientId,
              messageIds: idsToMark,
              timestamp: new Date().toISOString(),
            })
          );
        }

        // Atualizar o estado local
        setMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            read: idsToMark.includes(msg._id) ? true : msg.read,
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao marcar mensagens como lidas:", error);
    }
  };

  // Modificar o useEffect do WebSocket
  useEffect(() => {
    if (!ws) return;

    const handleWebSocketMessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "message":
            if (data.senderId === recipientId) {
              const newMsg = {
                _id: data.messageId,
                senderId: data.senderId,
                recipientId: userId,
                content: data.content,
                timestamp: data.timestamp,
                read: false,
              };

              setMessages((prev) => [...prev, newMsg]);

              if (onNewMessage) {
                onNewMessage(recipientId, newMsg);
              }

              // Marcar como lida se o chat estiver aberto
              try {
                await markMessagesAsRead([data.messageId]);
              } catch (error) {
                console.error("Erro ao marcar mensagem como lida:", error);
              }
            }
            break;

          case "messages_read":
            if (data.messageIds) {
              setMessages((prevMessages) =>
                prevMessages.map((msg) => ({
                  ...msg,
                  read: data.messageIds.includes(msg._id) ? true : msg.read,
                }))
              );
            }
            break;

          case "message_deleted":
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg._id === data.messageId
                  ? {
                      ...msg,
                      deleted: true,
                      deletedBy: data.senderId,
                      content:
                        data.senderId === userId
                          ? "Você excluiu esta mensagem"
                          : `${data.senderName} excluiu esta mensagem`,
                    }
                  : msg
              )
            );
            break;
        }
      } catch (error) {
        console.error("Erro ao processar mensagem WebSocket:", error);
      }
    };

    ws.addEventListener("message", handleWebSocketMessage);

    return () => {
      ws.removeEventListener("message", handleWebSocketMessage);
    };
  }, [ws, recipientId, userId, onNewMessage]);

  // Adicionar função para deletar mensagem
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Tem certeza que deseja deletar esta mensagem?")) {
      return;
    }

    try {
      setDeletingMessage(true);
      const response = await api.delete(`/messages/delete/${messageId}`);

      if (response.data.success) {
        // Atualizar estado local
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  deleted: true,
                  deletedBy: userId,
                  content: "Você excluiu esta mensagem",
                }
              : msg
          )
        );

        // Notificar via WebSocket que a mensagem foi deletada
        if (ws?.readyState === 1) {
          ws.send(
            JSON.stringify({
              type: "message_deleted",
              messageId: messageId,
              senderId: userId,
              recipientId: recipientId,
              deletedBy: userId,
            })
          );
        }

        // Notificar o ChatList sobre a atualização
        if (onNewMessage) {
          const updatedMessage = {
            _id: messageId,
            deleted: true,
            deletedBy: userId,
            senderId: userId,
            recipientId: recipientId,
            content: "Você excluiu esta mensagem",
            timestamp: new Date().toISOString(),
          };
          onNewMessage(recipientId, updatedMessage);
        }
      }
    } catch (error) {
      console.error("Erro ao deletar mensagem:", error);
      setError("Erro ao deletar mensagem");
    } finally {
      setDeletingMessage(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-lg flex flex-col ${
        isFloating
          ? "fixed bottom-4 right-4 w-96 h-[500px] z-50"
          : "w-full h-[600px]"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
        <div className="flex items-center">
          <h3 className="font-semibold">{recipientName}</h3>
          {!isConnected && (
            <span className="ml-2 text-xs text-red-500">(Desconectado)</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center p-4">
            Nenhuma mensagem ainda. Comece uma conversa!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === userId;
            return (
              <div
                key={msg._id}
                className={`mb-4 ${isMine ? "text-right" : "text-left"}`}
              >
                <div className="relative group">
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] break-words ${
                      msg.deleted
                        ? "bg-gray-100 text-gray-500 italic"
                        : isMine
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.content}
                    <div className="text-xs mt-1 opacity-75">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {isMine && !msg.deleted && (
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      disabled={deletingMessage}
                      className="absolute top-0 right-0 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      title="Deletar mensagem"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Indicador de digitação */}
      {isTyping && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-gray-500 bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: "200ms" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: "400ms" }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {recipientName} está digitando
            </span>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
            disabled={!isConnected || !userId}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected || !userId}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
