import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import config from "../Config/Config";

const REAL_ESTATE_COMPANIES = ["ERA", "Remax", "Century 21", "Zome", "Outro"];

const PromotionRequest = ({ onClose }) => {
  const { authData } = useAuth();
  const [formData, setFormData] = useState({
    agentLicense: "",
    phoneNumber: "",
    employer: "",
    customEmployer: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    agentLicense: "",
    phoneNumber: "",
    employer: "",
    customEmployer: "",
  });

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validação da licença
    if (!formData.agentLicense.match(/^AMI\d{6}$/)) {
      newErrors.agentLicense =
        'A licença deve começar com "AMI" seguido de 6 dígitos';
      isValid = false;
    }

    // Validação do telefone
    if (formData.phoneNumber.length < 9) {
      newErrors.phoneNumber = "O telefone deve ter pelo menos 9 dígitos";
      isValid = false;
    }

    // Validação do empregador
    if (!formData.employer) {
      newErrors.employer = "Selecione uma empresa";
      isValid = false;
    }

    // Validação do empregador customizado
    if (formData.employer === "Outro" && !formData.customEmployer.trim()) {
      newErrors.customEmployer = "Digite o nome da empresa";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "agentLicense") {
      formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    // Limpa o erro do campo que está sendo editado
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (!authData?.token) {
        toast.error("Você precisa estar logado para fazer esta solicitação");
        return;
      }

      const formattedLicense = formData.agentLicense.trim().toUpperCase();

      // Formatando os dados de acordo com o schema do backend
      const submissionData = {
        license: formattedLicense, // Mudado de agentLicense para license
        phoneNumber: formData.phoneNumber.replace(/\s+/g, ""),
        employer:
          formData.employer === "Outro"
            ? formData.customEmployer
            : formData.employer,
        user: authData.userId, // Adicionando o ID do usuário
      };

      console.log("=== Detalhes da Requisição ===");
      console.log("URL:", `${config.API_URL}/api/licenses/promotion-request`);
      console.log("Método:", "POST");
      console.log("Headers:", {
        Authorization: `Bearer ${authData.token}`,
        "Content-Type": "application/json",
      });
      console.log("Dados:", JSON.stringify(submissionData, null, 2));

      const response = await axios.post(
        `${config.API_URL}/api/licenses/promotion-request`,
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Resposta do servidor:", response.data);
      toast.success("Pedido de promoção enviado com sucesso!");
      onClose();
    } catch (error) {
      console.error("=== Detalhes do Erro ===");
      console.error("Mensagem:", error.message);
      console.error("Status:", error.response?.status);
      console.error("Dados do erro:", error.response?.data);

      let errorMessage;
      if (error.response?.status === 401) {
        errorMessage = "Sua sessão expirou. Por favor, faça login novamente.";
      } else if (error.response?.status === 403) {
        errorMessage = "Você não tem permissão para realizar esta ação.";
      } else if (error.response?.status === 404) {
        errorMessage =
          "Licença não encontrada no sistema. Por favor, verifique o número.";
      } else if (error.response?.status === 409) {
        errorMessage =
          "Já existe uma solicitação de promoção pendente para esta licença.";
      } else if (error.response?.status === 500) {
        const errorData = error.response?.data;
        if (errorData?.error?.includes("License not found")) {
          errorMessage =
            "Licença não encontrada no sistema. Por favor, verifique o número.";
        } else if (errorData?.error?.includes("already exists")) {
          errorMessage =
            "Já existe uma solicitação de promoção para esta licença.";
        } else {
          errorMessage =
            errorData?.error ||
            "Erro interno do servidor. Por favor, tente novamente.";
        }
      } else {
        errorMessage =
          "Ocorreu um erro ao enviar o pedido. Por favor, tente novamente.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Pedido de Promoção para Agente</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número da Licença de Agente
            </label>
            <input
              type="text"
              name="agentLicense"
              value={formData.agentLicense}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 ${
                errors.agentLicense
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              placeholder="Ex: AMI123456"
              maxLength={10}
              required
            />
            {errors.agentLicense && (
              <p className="mt-1 text-sm text-red-600">{errors.agentLicense}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telefone
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 ${
                errors.phoneNumber
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              placeholder="Ex: (+351) 912 345 678"
              required
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Empresa
            </label>
            <select
              name="employer"
              value={formData.employer}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 ${
                errors.employer
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
              }`}
              required
            >
              <option value="">Selecione uma empresa</option>
              {REAL_ESTATE_COMPANIES.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            {errors.employer && (
              <p className="mt-1 text-sm text-red-600">{errors.employer}</p>
            )}
          </div>

          {formData.employer === "Outro" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome da Empresa
              </label>
              <input
                type="text"
                name="customEmployer"
                value={formData.customEmployer}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 ${
                  errors.customEmployer
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="Digite o nome da empresa"
                required={formData.employer === "Outro"}
              />
              {errors.customEmployer && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.customEmployer}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar Pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionRequest;
