import React, { useState } from 'react';

const LoanCalculator = ({ propertyPrice, propertyType }) => {
  const [propertyValue, setPropertyValue] = useState(propertyPrice || 0);
  const [downPayment, setDownPayment] = useState((propertyPrice * 0.1) || 0);
  const [years, setYears] = useState(30);
  const [interestRate, setInterestRate] = useState(2.9);
  const [homeType, setHomeType] = useState('primaryResidence');
  const [loanDetails, setLoanDetails] = useState(null);

  const calculateLoanDetails = () => {
    const loanAmount = propertyValue - downPayment;
    const monthlyInterestRate = (interestRate / 100) / 12;
    const numberOfPayments = years * 12;
    const monthlyPayment =
      (loanAmount * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));

    const imt = calculateIMT(propertyValue, homeType);
    const stampDuty = calculateStampDuty(propertyValue);
    const taxes = stampDuty + imt;
    const registrationFee = 350;
    const totalPayment =
      taxes + registrationFee + monthlyPayment * numberOfPayments;
    const totalMortgage = loanAmount + taxes;
    const financing = (loanAmount / propertyValue) * 100;

    return {
      loanAmount,
      monthlyPayment,
      totalMortgage,
      financing,
      taxes,
      totalPayment,
    };
  };

  const handleCalculate = () => {
    const details = calculateLoanDetails();
    setLoanDetails(details);
  };

  const handleIncrement = (setter, value, step = 1) => setter(value + step);
  const handleDecrement = (setter, value, step = 1) => setter(Math.max(value - step, 0));

  const isFormValid =
    propertyValue > 0 &&
    downPayment >= 0 &&
    years > 0 &&
    interestRate > 0 &&
    homeType;

  return (
    <div className="flex flex-col md:flex-row justify-between gap-6 p-6 pt-16">
      <div className="flex-1 border border-gray-500 rounded-2xl bg-gray-100 p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Calcular Empréstimo</h3>

        <div className="mb-4">
          <label className="block font-bold text-gray-700 mb-1">Preço do imóvel</label>
          <div className="flex items-center border border-gray-500 rounded-full bg-gray-100 p-2">
            <button className="text-xl font-bold px-3" onClick={() => handleDecrement(setPropertyValue, propertyValue, 1000)}>−</button>
            <input
              type="number"
              value={propertyValue}
              placeholder={propertyPrice ? `${propertyPrice} €` : 'Insira o valor'}
              onChange={(e) => setPropertyValue(+e.target.value)}
              className="w-full text-center text-lg bg-transparent focus:outline-none"
            />
            <button className="text-xl font-bold px-3" onClick={() => handleIncrement(setPropertyValue, propertyValue, 1000)}>+</button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-bold text-gray-700 mb-1">Entrada</label>
          <div className="flex items-center border border-gray-500 rounded-full bg-gray-100 p-2">
            <button className="text-xl font-bold px-3" onClick={() => handleDecrement(setDownPayment, downPayment, 1000)}>−</button>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(+e.target.value)}
              className="w-full text-center text-lg bg-transparent focus:outline-none"
            />
            <button className="text-xl font-bold px-3" onClick={() => handleIncrement(setDownPayment, downPayment, 1000)}>+</button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-bold text-gray-700 mb-1">Prazo em anos</label>
          <div className="flex items-center border border-gray-500 rounded-full bg-gray-100 p-2">
            <button className="text-xl font-bold px-3" onClick={() => handleDecrement(setYears, years)}>−</button>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(+e.target.value)}
              className="w-full text-center text-lg bg-transparent focus:outline-none"
            />
            <button className="text-xl font-bold px-3" onClick={() => handleIncrement(setYears, years)}>+</button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-bold text-gray-700 mb-1">Taxa de juro (%)</label>
          <div className="flex items-center border border-gray-500 rounded-full bg-gray-100 p-2">
            <button className="text-xl font-bold px-3" onClick={() => handleDecrement(setInterestRate, interestRate, 0.1)}>−</button>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(+e.target.value)}
              className="w-full text-center text-lg bg-transparent focus:outline-none"
            />
            <button className="text-xl font-bold px-3" onClick={() => handleIncrement(setInterestRate, interestRate, 0.1)}>+</button>
          </div>
        </div>

        <div className="mb-4">
          {['Moradia', 'Apartamento'].includes(propertyType) && (
            <>
              <label className="block font-bold text-gray-700 mb-1">Tipo de casa</label>
              <div className="flex justify-center items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="homeType"
                    value="primaryResidence"
                    checked={homeType === 'primaryResidence'}
                    onChange={(e) => setHomeType(e.target.value)}
                  />
                  Primária
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="homeType"
                    value="secondaryResidence"
                    checked={homeType === 'secondaryResidence'}
                    onChange={(e) => setHomeType(e.target.value)}
                  />
                  Secundária
                </label>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleCalculate}
          disabled={!isFormValid}
          className="block mx-auto mt-6 py-2 px-4 rounded-full bg-gray-100 border border-gray-500 text-gray-700 text-lg font-bold w-3/4"
        >
          Calcular
        </button>
      </div>

      <div className="flex-1 border border-gray-500 rounded-2xl bg-gray-100 p-6 shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Prestação Mensal</h3>
        {loanDetails ? (
          <>
            <p>Valor crédito habitação: {loanDetails.loanAmount.toFixed(2)} €</p>
            <p>Percentagem de financiamento: {loanDetails.financing.toFixed(2)}%</p>
            <p>Impostos e despesas de compra: {loanDetails.taxes.toFixed(2)} €</p>
            <p>Custo total do imóvel: {loanDetails.totalMortgage.toFixed(2)} €</p>
            <p>Prestação mensal: {loanDetails.monthlyPayment.toFixed(2)} €</p>
          </>
        ) : (
          <p>Insira os valores e clique em "Calcular" para ver os resultados.</p>
        )}
      </div>
    </div>
  );
};

// Funções auxiliares para cálculo de impostos
const calculateIMT = (propertyValue, homeType) => {
  let rate, deduction;
  if (homeType === "primaryResidence") {
    if (propertyValue <= 97064) return 0;
    if (propertyValue <= 132774) return propertyValue * 0.02 - 1941.28;
    if (propertyValue <= 181034) return propertyValue * 0.05 - 5840.23;
    if (propertyValue <= 301688) return propertyValue * 0.07 - 9287.21;
    if (propertyValue <= 603576) return propertyValue * 0.08 - 11959.32;
    return propertyValue * 0.06;
  } else {
    return propertyValue * 0.08;
  }
};

const calculateStampDuty = (propertyValue) => propertyValue * 0.008;

export default LoanCalculator;
