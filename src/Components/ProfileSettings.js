import React, { useState, useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import api from "../api";
import { useAuth } from "../Context/AuthContext";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const ProfileSettings = ({ userInfo, onSaveChanges, onClose }) => {
  const { logout } = useAuth();
  const cropperRef = useRef(null);
  const [name, setName] = useState(userInfo?.name || "");
  const [email, setEmail] = useState(userInfo?.email || "");
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    userInfo?.image ? `${process.env.REACT_APP_API_URL}/${userInfo.image}` : ""
  );
  const [croppedImage, setCroppedImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropImage = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedDataURL = cropper.getCroppedCanvas().toDataURL();
      setCroppedImage(croppedDataURL);
      setProfileImage(croppedDataURL);
      setIsCropping(false);
    }
  };

  const handleProfileUpdate = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);

    if (profileImage) {
      const blob = await (await fetch(profileImage)).blob();
      formData.append("profile", blob, "profile-image.png");
    }

    try {
      await api.put("/users/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onSaveChanges({
        name,
        email,
        phone,
        image: profileImage ? "profile-image.png" : userInfo.image,
      });

      onClose();
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem.");
      setPasswordChangeStatus("error");
      return;
    }

    const formData = new FormData();
    formData.append("currentPassword", currentPassword);
    formData.append("password", newPassword);
    formData.append("confirmPassword", confirmPassword);

    try {
      await api.put("/users/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordChangeStatus("success");
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      setPasswordChangeStatus("error");
    }
  };

  async function handleDeleteAccount(token) {
    try {
      await api.delete("/users/delete-account", {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Cookies.remove("token", { path: "/" });
      Cookies.remove("userData", { path: "/" });
      localStorage.removeItem("authData");
      localStorage.removeItem("userData");

      navigate("/");
      window.location.reload();
    } catch (error) {
      if (error.response) {
        console.error("Erro ao excluir conta:", error.response.data);
      } else if (error.request) {
        console.error("Nenhuma resposta recebida:", error.request);
      } else {
        console.error("Erro ao configurar a solicitação:", error.message);
      }
    }
  }

  const toggleAccordion = (section) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[700px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Defenições da Conta</h2>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
          </div>

          {/* Acordeão 1: Defenições do Perfil */}
          <div className="mb-4">
            <button
              onClick={() => toggleAccordion("profile")}
              className="w-full text-left bg-gray-100 px-4 py-3 rounded-md flex justify-between items-center"
            >
              <span className="font-semibold">Defenições do Perfil</span>
              <span>{activeAccordion === "profile" ? "▲" : "▼"}</span>
            </button>

            {activeAccordion === "profile" && (
              <div className="p-4 space-y-4">
                {/* Recorte e seleção de imagem */}
                <div className="flex flex-col items-center mb-4">
                  {isCropping ? (
                    <>
                      <Cropper
                        src={imagePreview}
                        style={{ height: 300, width: "100%" }}
                        aspectRatio={1}
                        guides={true}
                        ref={cropperRef}
                      />
                      <button
                        onClick={handleCropImage}
                        className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                      >
                        Recortar Imagem
                      </button>
                    </>
                  ) : (
                    <>
                      {croppedImage || imagePreview ? (
                        <img
                          src={croppedImage || imagePreview}
                          alt="Imagem de perfil"
                          className="w-32 h-32 rounded-full object-cover mb-4"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                          Sem imagem
                        </div>
                      )}
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="mb-4"
                      />
                    </>
                  )}
                </div>

                {/* Campos de texto */}
                <input
                  type="text"
                  placeholder="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <button
                  onClick={handleProfileUpdate}
                  className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                >
                  Atualizar Perfil
                </button>
              </div>
            )}
          </div>

          {/* Acordeão 2: Alterar Senha */}
          <div className="mb-4">
            <button
              onClick={() => toggleAccordion("password")}
              className="w-full text-left bg-gray-100 px-4 py-3 rounded-md flex justify-between items-center"
            >
              <span className="font-semibold">Alterar Password</span>
              <span>{activeAccordion === "password" ? "▲" : "▼"}</span>
            </button>

            {activeAccordion === "password" && (
              <div className="p-4 space-y-4">
                <input
                  type="password"
                  placeholder="Senha atual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <button
                  onClick={handlePasswordChange}
                  className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600"
                >
                  Alterar Password
                </button>
                {passwordChangeStatus === "success" && (
                  <p className="text-green-600">Senha alterada com sucesso!</p>
                )}
                {passwordChangeStatus === "error" && (
                  <p className="text-red-600">
                    Erro ao alterar senha. Verifique as informações.
                  </p>
                )}
              </div>
            )}
          </div>
          {/* Acordeão 3: Apagar Conta */}
          <div className="mb-4">
            <button
              onClick={() => toggleAccordion("delete")}
              className="w-full text-left bg-gray-100 px-4 py-3 rounded-md flex justify-between items-center"
            >
              <span className="font-semibold">Apagar Conta</span>
              <span>{activeAccordion === "delete" ? "▲" : "▼"}</span>
            </button>

            {activeAccordion === "delete" && (
              <div className="p-4 space-y-4">
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
                >
                  Apagar Conta
                </button>
              </div>
            )}
          </div>

          {/* Modal de confirmação para apagar conta */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg w-full max-w-[500px]">
                <h3 className="text-lg font-semibold mb-4">
                  Tem certeza que deseja excluir sua conta?
                </h3>
                <div className="flex justify-between">
                  <button
                    onClick={() => setDeleteModalOpen(false)} // Fecha o modal
                    className="px-4 py-2 bg-gray-500 text-white rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Apagar Conta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileSettings;
