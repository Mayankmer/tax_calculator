import React, { useState } from 'react';

const TaxCalculator = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [regime, setRegime] = useState('old');
  const [ageGroup, setAgeGroup] = useState('below60');

  // Separate state for income and deductions
  const [incomeData, setIncomeData] = useState({
    salaryIncome: 0,
    interestIncome: 0,
    rentalIncome: 0,
    digitalAssetsIncome: 0,
    exemptAllowances: 0,
    homeLoanInterestSelf: 0,
    homeLoanInterestLetOut: 0,
    otherIncome: 0,
  });

  const [deductionData, setDeductionData] = useState({
    basicDeductions: 0,
    medicalInsurance: 0,
    housingLoanInterest: 0,
    npsEmployerContribution: 0,
    npsInterest: 0,
    charityDonations: 0,
    npsEmployeeContribution: 0,
    otherDeductions: 0,
  });

  const [taxResult, setTaxResult] = useState(null);

  // Handle input changes for income
  const handleIncomeChange = (e) => {
    const { name, value } = e.target;
    setIncomeData({
      ...incomeData,
      [name]: Number(value) || 0, // Ensure numeric values
    });
  };

  // Handle input changes for deductions
  const handleDeductionChange = (e) => {
    const { name, value } = e.target;
    setDeductionData({
      ...deductionData,
      [name]: Number(value) || 0, // Ensure numeric values
    });
  };

  // Calculate taxable income
  const calculateTaxableIncome = () => {
    const totalIncome = 
      incomeData.salaryIncome +
      incomeData.interestIncome +
      incomeData.rentalIncome +
      incomeData.digitalAssetsIncome +
      incomeData.otherIncome;

    const totalDeductions = regime === 'old' 
      ? deductionData.basicDeductions +
        deductionData.medicalInsurance +
        deductionData.housingLoanInterest +
        deductionData.npsEmployerContribution +
        deductionData.npsInterest +
        deductionData.charityDonations +
        deductionData.npsEmployeeContribution +
        deductionData.otherDeductions
      : 0;

    return totalIncome - totalDeductions;
  };

  // Tax calculation logic for old regime
  const calculateOldRegimeTax = (income) => {
    let tax = 0;
    const exemptionLimit = 
      ageGroup === 'below60' ? 250000 :
      ageGroup === 'between60and80' ? 300000 : 500000;

    if (income <= exemptionLimit) return 0;

    const taxable = income - exemptionLimit;
    if (taxable <= 250000) tax = taxable * 0.05;
    else if (taxable <= 500000) tax = 12500 + (taxable - 250000) * 0.1;
    else if (taxable <= 1000000) tax = 62500 + (taxable - 500000) * 0.2;
    else tax = 112500 + (taxable - 1000000) * 0.3;

    return tax;
  };

  // Tax calculation logic for new regime
  const calculateNewRegimeTax = (income) => {
    let tax = 0;
    if (income <= 700000) return 0; // Standard rebate
    const taxable = income;
    if (taxable <= 300000) tax = 0;
    else if (taxable <= 600000) tax = (taxable - 300000) * 0.05;
    else if (taxable <= 900000) tax = 15000 + (taxable - 600000) * 0.1;
    else if (taxable <= 1200000) tax = 45000 + (taxable - 900000) * 0.15;
    else if (taxable <= 1500000) tax = 90000 + (taxable - 1200000) * 0.2;
    else tax = 150000 + (taxable - 1500000) * 0.3;
    return tax;
  };

  // Calculate tax based on the selected regime
  const calculateTax = () => {
    const taxableIncome = calculateTaxableIncome();
    const oldRegimeTax = calculateOldRegimeTax(taxableIncome);
    const newRegimeTax = calculateNewRegimeTax(taxableIncome);
    
    setTaxResult({
      oldRegimeTax,
      newRegimeTax,
      savings: Math.max(oldRegimeTax, newRegimeTax) - Math.min(oldRegimeTax, newRegimeTax)
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Regime Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setRegime('old')}
          className={`px-4 py-2 ${regime === 'old' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Old Regime
        </button>
        <button
          onClick={() => setRegime('new')}
          className={`px-4 py-2 ${regime === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          New Regime
        </button>
      </div>

      {/* Age Group Dropdown */}
      <select 
        value={ageGroup} 
        onChange={(e) => setAgeGroup(e.target.value)}
        className="mb-6 p-2 border"
      >
        <option value="below60">Below 60</option>
        <option value="between60and80">60-80</option>
        <option value="above80">Above 80</option>
      </select>

      {/* Income/Deduction Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 ${activeTab === 'income' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Income
        </button>
        <button
          onClick={() => setActiveTab('deductions')}
          className={`px-4 py-2 ${activeTab === 'deductions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Deductions
        </button>
      </div>

      {/* Dynamic Form Fields */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {activeTab === 'income' ? (
          <>
            <input type="number" name="salaryIncome" placeholder="Salary Income" onChange={handleIncomeChange} className="p-2 border" />
            <input type="number" name="interestIncome" placeholder="Interest Income" onChange={handleIncomeChange} className="p-2 border" />
            <input type="number" name="rentalIncome" placeholder="Rental Income" onChange={handleIncomeChange} className="p-2 border" />
            <input type="number" name="digitalAssetsIncome" placeholder="Digital Assets Income" onChange={handleIncomeChange} className="p-2 border" />
            <input type="number" name="homeLoanInterestSelf" placeholder="Home Loan Interest (Self)" onChange={handleIncomeChange} className="p-2 border" />
            <input type="number" name="homeLoanInterestLetOut" placeholder="Home Loan Interest (Let Out)" onChange={handleIncomeChange} className="p-2 border" />
            <input type="number" name="otherIncome" placeholder="Other Income" onChange={handleIncomeChange} className="p-2 border" />
          </>
        ) : (
          <>
            <input type="number" name="basicDeductions" placeholder="80C Deductions" onChange={handleDeductionChange} className="p-2 border" />
            <input type="number" name="medicalInsurance" placeholder="80D Deductions" onChange={handleDeductionChange} className="p-2 border" />
            <input type="number" name="housingLoanInterest" placeholder="80EEA Deductions" onChange={handleDeductionChange} className="p-2 border" />
            <input type="number" name="npsEmployerContribution" placeholder="NPS Employer Contribution" onChange={handleDeductionChange} className="p-2 border" />
            <input type="number" name="npsInterest" placeholder="80TTA Deductions" onChange={handleDeductionChange} className="p-2 border" />
            <input type="number" name="charityDonations" placeholder="80G Deductions" onChange={handleDeductionChange} className="p-2 border" />
            <input type="number" name="npsEmployeeContribution" placeholder="NPS Employee Contribution" onChange={handleDeductionChange} className="p-2 border" />
            <input type="number" name="otherDeductions" placeholder="Other Deductions" onChange={handleDeductionChange} className="p-2 border" />
          </>
        )}
      </div>

      {/* Results and Recalculate */}
      {taxResult && (
        <div className="mt-6 p-4 bg-gray-100">
          <h3 className="text-xl mb-4">Tax Comparison</h3>
          <p>Old Regime Tax: ₹{taxResult.oldRegimeTax.toFixed(2)}</p>
          <p>New Regime Tax: ₹{taxResult.newRegimeTax.toFixed(2)}</p>
          <p>Savings: ₹{taxResult.savings.toFixed(2)}</p>
          <button 
            onClick={() => setTaxResult(null)} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 hover:bg-blue-600"
          >
            Recalculate
          </button>
        </div>
      )}

      <button 
        onClick={calculateTax} 
        className="bg-green-500 text-white px-6 py-3 hover:bg-green-600"
      >
        Calculate Tax
      </button>
    </div>
  );
};

export default TaxCalculator;