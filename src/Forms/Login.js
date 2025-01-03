import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginModal = ({
  isOpen,
  onClose,
  onOpenForgotPassword,
  openRegisterModal ,
}) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const success = await login(formData.email, formData.password);
      setLoading(false);
  
      if (success) {
        navigate("/"); // Redirect to the homepage or desired route
        onClose();
      } else {
        setError("Erro ao fazer login. Verifique suas credenciais.");
      }
    } catch (error) {
      setError("Erro no servidor. Tente novamente mais tarde.");
      setLoading(false);
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600">
          X
        </button>
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">DELIGHT</h1>
          <p className="text-sm">REAL ESTATE</p>
        </div>
        <h2 className="text-center text-sm font-semibold mb-4">INICIAR SESSÃO</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={`w-full p-2 border ${error ? "border-red-500" : "border-gray-300"} rounded-full focus:outline-none`}
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Palavra-passe"
              className={`w-full p-2 border ${error ? "border-red-500" : "border-gray-300"} rounded-full focus:outline-none`}
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-3 text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="text-right text-sm">
            <a
              href="#"
              className="text-blue-500"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                onOpenForgotPassword();
              }}
            >
              Esqueceu-se da palavra-passe?
            </a>
          </div>
          <button type="submit" className="w-full p-2 bg-gray-800 text-white rounded-full" disabled={loading}>
            {loading ? "Entrando..." : "Iniciar Sessão"}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Não tem conta?{" "}
          <a
            href="#"
            className="text-blue-500"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              openRegisterModal();
            }}
          >
            Registe-se
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
