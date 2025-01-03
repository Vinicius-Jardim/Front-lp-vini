import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../Context/AuthContext";
import api from "../../api";
import ChatWindow from "./ChatWindow";
import { FaExpandAlt, FaCompressAlt } from "react-icons/fa";
import config from "../../Config/Config";
import { BsLayoutSplit, BsLayoutSidebar } from "react-icons/bs";

const ChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [isFloatingMode, setIsFloatingMode] = useState(() => {
    const saved = localStorage.getItem("chatFloatingMode");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const { authData } = useAuth();
  const ws = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    localStorage.setItem("chatFloatingMode", JSON.stringify(isFloatingMode));
  }, [isFloatingMode]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get("/messages/conversations");
        const conversationsWithTyping = response.data.map((conv) => ({
          ...conv,
          isTyping: false,
        }));
        setConversations(conversationsWithTyping);
        setLoading(false);
      } catch (err) {
        setError("Erro ao carregar conversas");
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const connectWebSocket = () => {
    if (!authData?.id || !authData?.token) {
      console.error("Dados de autenticação ausentes");
      return;
    }

    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = `${config.WS_URL}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      ws.current.send(
        JSON.stringify({
          type: "auth",
          token: authData.token,
          userId: authData.id,
        })
      );
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setTimeout(connectWebSocket, 5000);
    };

    ws.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Mensagem WebSocket recebida:", data);

        switch (data.type) {
          case "message":
          case "message_sent":
            if (data.type === "message_sent" && data.senderId === authData.id) {
              return;
            }

            const newMsg = {
              _id: data.messageId,
              senderId: data.senderId,
              recipientId: data.recipientId,
              content: data.content,
              timestamp: data.timestamp,
              read: false,
            };

            setConversations((prevConversations) => {
              return prevConversations.map((conv) => {
                if (conv.otherParticipant._id === data.senderId) {
                  const isChatActive =
                    activeChat &&
                    activeChat.otherParticipant._id === data.senderId;

                  if (isChatActive) {
                    newMsg.read = true;

                    (async () => {
                      try {
                        await api.post("/messages/mark-read", {
                          messageIds: [data.messageId],
                        });

                        if (ws.current?.readyState === 1) {
                          ws.current.send(
                            JSON.stringify({
                              type: "messages_read",
                              senderId: authData.id,
                              recipientId: data.senderId,
                              messageIds: [data.messageId],
                              timestamp: new Date().toISOString(),
                            })
                          );
                        }
                      } catch (error) {
                        console.error(
                          "Erro ao marcar mensagem como lida:",
                          error
                        );
                      }
                    })();
                  }

                  return {
                    ...conv,
                    messages: [newMsg, ...conv.messages],
                    unreadCount: conv.unreadCount,
                  };
                }
                return conv;
              });
            });
            break;

          case "messages_read":
            setConversations((prevConversations) => {
              return prevConversations.map((conv) => {
                if (conv.otherParticipant._id === data.recipientId) {
                  return {
                    ...conv,
                    messages: conv.messages.map((msg) => ({
                      ...msg,
                      read: data.messageIds.includes(msg._id) ? true : msg.read,
                    })),
                    unreadCount: 0,
                  };
                }
                return conv;
              });
            });
            break;

          case "typing_status":
            setConversations((prevConversations) => {
              return prevConversations.map((conv) => {
                if (conv.otherParticipant._id === data.senderId) {
                  const updatedConv = {
                    ...conv,
                    isTyping: data.isTyping,
                  };

                  if (activeChat?.otherParticipant._id === data.senderId) {
                    setActiveChat((prevChat) => ({
                      ...prevChat,
                      isTyping: data.isTyping,
                    }));
                  }

                  return updatedConv;
                }
                return conv;
              });
            });
            break;

          case "message_deleted":
            setConversations((prevConversations) => {
              return prevConversations.map((conv) => {
                const hasDeletedMessage = conv.messages.some(
                  (msg) => msg._id === data.messageId
                );

                if (hasDeletedMessage) {
                  const updatedMessages = conv.messages.map((msg) => {
                    if (msg._id === data.messageId) {
                      const wasDeletedByMe = data.senderId === authData.id;

                      return {
                        ...msg,
                        deleted: true,
                        deletedBy: data.senderId,
                        content: wasDeletedByMe
                          ? "Você excluiu esta mensagem"
                          : `${data.senderName} excluiu esta mensagem`,
                      };
                    }
                    return msg;
                  });

                  const lastMessage = updatedMessages[0];
                  if (lastMessage && lastMessage.deleted) {
                    const wasDeletedByMe =
                      lastMessage.deletedBy === authData.id;
                    lastMessage.content = wasDeletedByMe
                      ? "Você excluiu esta mensagem"
                      : `${data.senderName} excluiu esta mensagem`;
                  }

                  return {
                    ...conv,
                    messages: updatedMessages,
                  };
                }
                return conv;
              });
            });
            break;
        }
      } catch (error) {
        console.error("Erro ao processar mensagem:", error);
      }
    };
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [authData]);

  const handleChatClick = async (conversation) => {
    const currentConversation = conversations.find(
      (conv) => conv.otherParticipant._id === conversation.otherParticipant._id
    );

    const fullConversation = {
      ...conversation,
      isTyping: currentConversation?.isTyping || false,
    };

    setActiveChat(fullConversation);
    console.log("Setting active chat with:", fullConversation);

    if (conversation.unreadCount > 0) {
      try {
        const unreadMessages = conversation.messages
          .filter((msg) => !msg.read && msg.senderId !== authData.id)
          .map((msg) => msg._id);

        if (unreadMessages.length > 0) {
          await api.post("/messages/mark-read", {
            messageIds: unreadMessages,
          });

          setConversations((prevConversations) =>
            prevConversations.map((conv) => {
              if (
                conv.otherParticipant._id === conversation.otherParticipant._id
              ) {
                const updatedConv = {
                  ...conv,
                  unreadCount: 0,
                  messages: conv.messages.map((msg) => ({
                    ...msg,
                    read: true,
                  })),
                };

                if (
                  fullConversation.otherParticipant._id ===
                  conv.otherParticipant._id
                ) {
                  setActiveChat(updatedConv);
                }

                return updatedConv;
              }
              return conv;
            })
          );
        }
      } catch (error) {
        console.error("Erro ao marcar mensagens como lidas:", error);
      }
    }
  };

  const updateLastMessage = (recipientId, newMessage) => {
    setConversations((prevConversations) =>
      prevConversations.map((conv) => {
        if (conv.otherParticipant._id === recipientId) {
          let messageContent;
          const isMine = newMessage.senderId === authData.id;
          const prefix = isMine ? "Você: " : `${conv.otherParticipant.name}: `;

          if (newMessage.deleted) {
            messageContent =
              newMessage.deletedBy === authData.id
                ? "Você excluiu esta mensagem"
                : `${conv.otherParticipant.name} excluiu esta mensagem`;
          } else {
            messageContent = prefix + newMessage.content;
          }

          const updatedMessage = {
            ...newMessage,
            content: messageContent,
            deleted: newMessage.deleted || false,
            deletedBy: newMessage.deletedBy,
          };

          return {
            ...conv,
            messages: [updatedMessage, ...conv.messages],
          };
        }
        return conv;
      })
    );
  };

  const renderUserImage = (user) => {
    if (user.image) {
      return (
        <img
          src={`${config.API_URL}/${user.image}`}
          alt={user.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
        <span className="text-gray-600">{user.name.charAt(0)}</span>
      </div>
    );
  };

  useEffect(() => {
    if (activeChat) {
      console.log("Active chat atualizado:", {
        id: activeChat.otherParticipant._id,
        name: activeChat.otherParticipant.name,
        isTyping: activeChat.isTyping,
      });
    }
  }, [activeChat]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Minhas Conversas
        </h2>
        <button
          onClick={() => setIsFloatingMode(!isFloatingMode)}
          className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
            isFloatingMode
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          title={
            isFloatingMode ? "Modo Pop-up (Ativo)" : "Modo Integrado (Ativo)"
          }
        >
          {isFloatingMode ? (
            <>
              <BsLayoutSplit size={20} />
              <span className="text-sm">Pop-up</span>
            </>
          ) : (
            <>
              <BsLayoutSidebar size={20} />
              <span className="text-sm">Integrado</span>
            </>
          )}
        </button>
      </div>

      <div className="flex gap-4">
        <div className="w-1/3 min-w-[300px]">
          <div className="grid gap-4">
            {conversations.length === 0 ? (
              <p className="text-gray-500 text-center">
                Nenhuma conversa encontrada
              </p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.otherParticipant._id}
                  onClick={() => handleChatClick(conversation)}
                  className={`flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 
                                        ${
                                          activeChat?.otherParticipant._id ===
                                          conversation.otherParticipant._id
                                            ? "border-2 border-blue-500"
                                            : ""
                                        }`}
                >
                  {renderUserImage(conversation.otherParticipant)}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">
                      {conversation.otherParticipant.name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.isTyping ? (
                        <span className="italic">Está digitando...</span>
                      ) : (
                        <span
                          className={
                            conversation.messages[0]?.deleted ? "italic" : ""
                          }
                        >
                          {conversation.messages[0]?.content}
                        </span>
                      )}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 &&
                    !conversation.messages[0]?.read && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex-shrink-0">
                        {conversation.unreadCount}
                      </span>
                    )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1">
          {activeChat ? (
            isFloatingMode ? (
              <div className="fixed inset-0 pointer-events-none">
                <div className="fixed bottom-4 right-4 w-96 pointer-events-auto">
                  <ChatWindow
                    recipientId={activeChat.otherParticipant._id}
                    recipientName={activeChat.otherParticipant.name}
                    onClose={() => setActiveChat(null)}
                    isFloating={true}
                    onNewMessage={updateLastMessage}
                    isTyping={
                      conversations.find(
                        (conv) =>
                          conv.otherParticipant._id ===
                          activeChat.otherParticipant._id
                      )?.isTyping || false
                    }
                    ws={ws.current}
                    isConnected={isConnected}
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <ChatWindow
                  recipientId={activeChat.otherParticipant._id}
                  recipientName={activeChat.otherParticipant.name}
                  onClose={() => setActiveChat(null)}
                  isFloating={false}
                  onNewMessage={updateLastMessage}
                  isTyping={
                    conversations.find(
                      (conv) =>
                        conv.otherParticipant._id ===
                        activeChat.otherParticipant._id
                    )?.isTyping || false
                  }
                  ws={ws.current}
                  isConnected={isConnected}
                />
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Selecione uma conversa para começar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
