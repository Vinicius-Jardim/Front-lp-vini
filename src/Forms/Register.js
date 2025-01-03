import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../Context/AuthContext";

const RegisterModal = ({ isOpen, onClose, openLoginModal }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validatePassword = () => {
    const { password } = formData;
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*-_]/.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!validatePassword()) {
      setError(
        "A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos."
      );
      return;
    }

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      const success = await register(userData);

      if (success) {
        onClose();
      } else {
        setError("Erro ao registrar. Tente novamente.");
      }
    } catch (error) {
      setError("Erro no servidor. Tente novamente mais tarde.");
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
        <h2 className="text-center text-sm font-semibold mb-4">CRIAR CONTA</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Nome"
            className="w-full p-2 border border-gray-300 rounded-full focus:outline-none"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded-full focus:outline-none"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Palavra-passe"
              className="w-full p-2 border border-gray-300 rounded-full focus:outline-none"
              value={formData.password}
              onChange={handleChange}
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
          >
            Criar Conta
          </button>
        </form>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <p className="text-center text-sm mt-4">
          Já tem uma conta?{" "}
                      <a
            href="#"
            className="text-blue-500"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              openLoginModal();
            }}
          >
            Inicie sessão
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterModal;
