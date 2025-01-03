import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import api from "../api";
import { useAuth } from "../Context/AuthContext";

const AdminRegister = ({ isOpen, onClose }) => {
  const { authData } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = () => {
    const { password } = formData;
    const trimmedPassword = password.trim();

    if (trimmedPassword.length < 8) {
      return {
        isValid: false,
        message: "A senha deve ter pelo menos 8 caracteres.",
      };
    }

    const hasUpperCase = /[A-Z]/.test(trimmedPassword);
    const hasLowerCase = /[a-z]/.test(trimmedPassword);
    const hasNumbers = /[0-9]/.test(trimmedPassword);
    const hasSpecialChars = /[!@#$%^&*()_+\-={};':"|,.<>/?]+/.test(
      trimmedPassword
    );

    if (!hasUpperCase) {
      return {
        isValid: false,
        message: "A senha deve conter pelo menos uma letra maiúscula.",
      };
    }
    if (!hasLowerCase) {
      return {
        isValid: false,
        message: "A senha deve conter pelo menos uma letra minúscula.",
      };
    }
    if (!hasNumbers) {
      return {
        isValid: false,
        message: "A senha deve conter pelo menos um número.",
      };
    }
    if (!hasSpecialChars) {
      return {
        isValid: false,
        message: "A senha deve conter pelo menos um símbolo especial.",
      };
    }

    return { isValid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccessMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword();
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    try {
      await api.post(
        "/admins/create-admin",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
        {
          headers: { Authorization: `Bearer ${authData.token}` },
        }
      );

      setSuccessMessage("Administrador criado com sucesso!");
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao criar administrador. Tente novamente.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600"
        >
          X
        </button>
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">DELIGHT</h1>
          <p className="text-sm">REAL ESTATE</p>
        </div>
        <h2 className="text-center text-sm font-semibold mb-4">
          CRIAR ADMINISTRADOR
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nome"
            className="w-full p-2 border border-gray-300 rounded-full focus:outline-none"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded-full focus:outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Palavra-passe"
              className="w-full p-2 border border-gray-300 rounded-full focus:outline-none"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-3 text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirmar Palavra-passe"
              className="w-full p-2 border border-gray-300 rounded-full focus:outline-none"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-3 text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full p-2 bg-gray-800 text-white rounded-full"
            disabled={loading}
          >
            {loading ? "Criando..." : "Criar Administrador"}
          </button>
        </form>

        {successMessage && (
          <p className="text-green-500 text-center mt-4">{successMessage}</p>
        )}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default AdminRegister;
