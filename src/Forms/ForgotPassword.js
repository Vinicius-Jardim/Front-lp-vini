// ForgotPasswordModal.js
import React, { useState } from 'react';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Adicione aqui a lógica para recuperação de senha, como chamada à API
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
        <h2 className="text-center text-sm font-semibold mb-4">RECUPERAR PALAVRA-PASSE</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email de acesso"
            className="w-full p-2 border border-gray-300 rounded-full focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full p-2 bg-gray-800 text-white rounded-full">
            Recuperar Palavra-passe
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
