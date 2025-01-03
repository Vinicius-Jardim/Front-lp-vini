import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../Config/Config";
import { FaEdit, FaTrash, FaQrcode } from "react-icons/fa";
import api from "../api";
import QRCode from "qrcode";
import { createCanvas, loadImage } from "canvas";
import logoD from "../logo1.png";

const Property = ({ house, onDelete, isAgentProperty = false }) => {
  const navigate = useNavigate();
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const formatPrice = (price) => {
    const priceNum = parseFloat(price);
    // Verifica se tem decimais diferentes de zero
    return priceNum % 1 === 0 ? parseInt(price) : priceNum.toFixed(2);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/edit-property/${house._id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir este imóvel?")) {
      try {
        await api.delete(`/properties/delete/${house._id}`);
        if (onDelete) {
          onDelete(house._id);
        }
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Erro ao excluir o imóvel. Tente novamente.");
      }
    }
  };

  const handleGenerateQRCode = async (e) => {
    e.stopPropagation();
    setIsGeneratingQR(true);

    try {
      if (!house || !house._id) {
        throw new Error("Property is not defined or missing _id");
      }

      const propertyUrl = `${window.location.origin}/property/${house._id}`;
      console.log("Property URL:", propertyUrl);

      const qrCodeUrl = await QRCode.toDataURL(propertyUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#595858",
          light: "#f4f5f5",
        },
      });
      console.log("QR Code URL:", qrCodeUrl);

      const canvas = createCanvas(300, 300);
      const ctx = canvas.getContext("2d");

      const qrImage = await loadImage(qrCodeUrl);
      ctx.drawImage(qrImage, 0, 0, 300, 300);

      const logo = await loadImage(logoD);
      const logoSize = 50;
      const logoX = (canvas.width - logoSize) / 2;
      const logoY = (canvas.height - logoSize) / 2;

      ctx.strokeStyle = "#f4f5f5";
      ctx.lineWidth = 10;
      ctx.strokeRect(logoX, logoY, logoSize, logoSize);
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

      const finalQrCodeUrl = canvas.toDataURL("image/png");
      console.log("Final QR Code URL:", finalQrCodeUrl);
      const response = await fetch(finalQrCodeUrl);
      const blob = await response.blob();

      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `qrcode_${house._id}.png`,
        types: [
          {
            description: "Imagem PNG",
            accept: { "image/png": [".png"] },
          },
        ],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro ao gerar QR Code:", error);
        alert("Não foi possível gerar o QR Code");
      }
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handlePropertyClick = () => {
    navigate(`/property/${house._id}`);
  };

  return (
    <div
      className="bg-[#f4f5f5] p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-300"
      onClick={handlePropertyClick}
    >
      <div className="w-full h-48 bg-gray-300 overflow-hidden relative rounded-t-lg">
        {house.fotos && house.fotos.length > 0 ? (
          <img
            src={`${config.API_URL}/${house.fotos[0]}`}
            alt={`Foto de ${house.type}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            Imagem indisponível
          </div>
        )}

        {house.status === "Reserved" && (
          <div className="absolute top-5 -right-8 transform rotate-45 w-32 text-center bg-red-600 text-white py-1 shadow-lg z-10">
            <span className="font-semibold text-xs tracking-wider">
              RESERVADO
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-800">{house.type}</p>
        <p className="text-gray-600 text-sm">
          {house.street} {house.doorNumber} | {house.city}
        </p>
        {house.type === "Terreno" ? (
          <h5 className="font-bold text-gray-600">{house.size} m²</h5>
        ) : (
          <h5 className="font-bold text-gray-600">
            T{house.bedrooms} | {house.bathrooms} Casas de Banho
          </h5>
        )}
        <h5 className="font-bold text-gray-600 text-right">
          {formatPrice(house.price)} €
        </h5>
        {isAgentProperty && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={handleGenerateQRCode}
              disabled={isGeneratingQR}
              className="p-2 text-black-600 hover:bg-black-50 rounded-full transition-colors"
              title="Gerar QR Code"
            >
              {isGeneratingQR ? "A gerar..." : <FaQrcode size={18} />}
            </button>

            <button
              onClick={handleEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Editar"
            >
              <FaEdit size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Excluir"
            >
              <FaTrash size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Property;
