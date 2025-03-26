import React, { useState } from 'react';
import Advice from './components/Advice';
import TaxReportPDF from './components/TaxReportPDF';
import { saveTaxCalculation } from './schemas/TaxSchema';

const TaxCalculator = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [regime, setRegime] = useState('old');
  const [ageGroup, setAgeGroup] = useState('below60');
  const [taxResult, setTaxResult] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Income Details State
  const [incomeData, setIncomeData] = useState({
    salaryIncome: 0,
    interestIncome: 0,
    rentalIncome: 0,
    capitalGains: 0,
    otherIncome: 0,
  });

  // Deductions State (Old Regime)
  const [deductionData, setDeductionData] = useState({
    section80C: 0,
    section80D: 0,
    section24: 0,
    section80CCD: 0,
    section80G: 0,
    section80E: 0,
    section80TTA: 0,
  });

  const handleInputChange = (setter) => (e) => {
    setter(prev => ({
      ...prev,
      [e.target.name]: Number(e.target.value) || 0
    }));
  };

  const calculateOldRegimeTax = (taxableIncome) => {
    const exemption = {
      below60: 250000,
      between60and80: 300000,
      above80: 500000
    }[ageGroup];

    let remaining = Math.max(0, taxableIncome - exemption);
    
    const slabs = [
      { limit: 250000, rate: 0 },
      { limit: 500000, rate: 5 },
      { limit: 1000000, rate: 20 },
      { limit: Infinity, rate: 30 }
    ];

    let tax = 0;
    slabs.forEach((slab, index) => {
      if (remaining <= 0) return;
      const prevLimit = index === 0 ? 0 : slabs[index-1].limit;
      const slabAmount = Math.min(remaining, slab.limit - prevLimit);
      tax += slabAmount * (slab.rate / 100);
      remaining -= slabAmount;
    });

    return tax * 1.04; // Add 4% cess
  };

  const calculateNewRegimeTax = (taxableIncome) => {
    const slabs = [
      { limit: 400000, rate: 0 },
      { limit: 800000, rate: 5 },
      { limit: 1200000, rate: 10 },
      { limit: 1600000, rate: 15 },
      { limit: 2000000, rate: 20 },
      { limit: 2400000, rate: 25 },
      { limit: Infinity, rate: 30 }
    ];

    let tax = 0;
    let remaining = taxableIncome;

    slabs.forEach((slab, index) => {
      if (remaining <= 0) return;
      const prevLimit = index === 0 ? 0 : slabs[index-1].limit;
      const slabAmount = Math.min(remaining, slab.limit - prevLimit);
      tax += slabAmount * (slab.rate / 100);
      remaining -= slabAmount;
    });

    //rebate 
    if (taxableIncome <= 1200000) {
      tax = 0;
    }

    return tax * 1.04; // Add 4% cess
  };

  const calculateTax = async () => {
    try {
      setSaving(true);
      setError(null);

      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        throw new Error('User not authenticated. Please login again.');
      }

      const totalIncome = Object.values(incomeData).reduce((sum, val) => sum + val, 0);
      
      // Automatic standard deduction for old regime (₹50,000 if salaried)
      const oldStandardDeduction = incomeData.salaryIncome > 0 ? 50000 : 0;
      const oldDeductions = oldStandardDeduction + Object.values(deductionData).reduce((sum, val) => sum + val, 0);
      
      const newDeductions = 75000;

      const oldTaxable = Math.max(0, totalIncome - oldDeductions);
      const newTaxable = Math.max(0, totalIncome - newDeductions);

      const oldTax = calculateOldRegimeTax(oldTaxable);
      const newTax = calculateNewRegimeTax(newTaxable);

      const result = {
        oldRegime: {
          totalIncome,
          deductions: oldDeductions,
          taxableIncome: oldTaxable,
          tax: Math.round(oldTax)
        },
        newRegime: {
          totalIncome,
          deductions: newDeductions,
          taxableIncome: newTaxable,
          tax: Math.round(newTax)
        }
      };

      setTaxResult(result);
      setShowComparison(false);

      // Prepare data for MongoDB with the user's ObjectId
      const taxData = {
        userId: user._id, // MongoDB ObjectId from the logged-in user
        ageGroup,
        selectedRegime: regime,
        incomeData,
        deductionData,
        taxResult: result,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to MongoDB
      const savedCalculation = await saveTaxCalculation(taxData);
      console.log('Tax calculation saved:', savedCalculation);

    } catch (err) {
      setError(err.message || 'Error saving tax calculation');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount || 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
          Income Tax Calculator FY 2024-25
        </h1>

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

        {/* Age Group Selector */}
        <select 
          value={ageGroup} 
          onChange={(e) => setAgeGroup(e.target.value)}
          className="mb-6 p-2 border w-full"
        >
          <option value="below60">Below 60 years</option>
          <option value="between60and80">60-80 years</option>
          <option value="above80">Above 80 years</option>
        </select>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-2 ${activeTab === 'income' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Income Sources
          </button>
          <button
            onClick={() => setActiveTab('deductions')}
            className={`px-4 py-2 ${activeTab === 'deductions' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            disabled={regime === 'new'}
          >
            Deductions (Old Regime)
          </button>
        </div>

        {/* Income Form */}
        <div className={`grid grid-cols-2 gap-4 mb-6 ${activeTab === 'income' ? 'block' : 'hidden'}`}>
          <input
            type="number"
            placeholder="Salary Income"
            name="salaryIncome"
            className="p-2 border"
            onChange={handleInputChange(setIncomeData)}
          />
          <input
            type="number"
            placeholder="Interest Income"
            name="interestIncome"
            className="p-2 border"
            onChange={handleInputChange(setIncomeData)}
          />
          <input
            type="number"
            placeholder="Rental Income"
            name="rentalIncome"
            className="p-2 border"
            onChange={handleInputChange(setIncomeData)}
          />
          <input
            type="number"
            placeholder="Capital Gains"
            name="capitalGains"
            className="p-2 border"
            onChange={handleInputChange(setIncomeData)}
          />
          <input
            type="number"
            placeholder="Other Income"
            name="otherIncome"
            className="p-2 border"
            onChange={handleInputChange(setIncomeData)}
          />
        </div>

        {/* Deductions Form */}
        <div className={`grid grid-cols-2 gap-4 mb-6 ${activeTab === 'deductions' ? 'block' : 'hidden'}`}>
          <input
            type="number"
            placeholder="Section 80C (Max ₹1.5L)"
            name="section80C"
            className="p-2 border"
            onChange={handleInputChange(setDeductionData)}
            max="150000"
            disabled={regime === 'new'}
          />
          <input
            type="number"
            placeholder="Section 80D (Medical)"
            name="section80D"
            className="p-2 border"
            onChange={handleInputChange(setDeductionData)}
            disabled={regime === 'new'}
          />
          <input
            type="number"
            placeholder="Section 24 (Home Loan)"
            name="section24"
            className="p-2 border"
            onChange={handleInputChange(setDeductionData)}
            disabled={regime === 'new'}
          />
          <input
            type="number"
            placeholder="Section 80CCD (NPS)"
            name="section80CCD"
            className="p-2 border"
            onChange={handleInputChange(setDeductionData)}
            disabled={regime === 'new'}
          />
          <input
            type="number"
            placeholder="Section 80G (Donations)"
            name="section80G"
            className="p-2 border"
            onChange={handleInputChange(setDeductionData)}
            disabled={regime === 'new'}
          />
          <input
            type="number"
            placeholder="Section 80E (Education Loan)"
            name="section80E"
            className="p-2 border"
            onChange={handleInputChange(setDeductionData)}
            disabled={regime === 'new'}
          />
          <input
            type="number"
            placeholder="Section 80TTA (Savings)"
            name="section80TTA"
            className="p-2 border"
            onChange={handleInputChange(setDeductionData)}
            disabled={regime === 'new'}
          />
        </div>

        <button 
          onClick={calculateTax}
          disabled={saving}
          className={`bg-green-500 text-white px-6 py-3 w-full hover:bg-green-600 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {saving ? 'Calculating...' : 'Calculate Tax'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Results Section */}
        {taxResult && (
          <div className="mt-8">
            <div className="mb-4 p-4 bg-blue-50 rounded">
              <h3 className="text-lg font-semibold">
                {regime === 'old' ? 'Old' : 'New'} Regime Tax: {formatCurrency(taxResult[`${regime}Regime`].tax)}
              </h3>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="mt-4 text-blue-600 underline"
              >
                {showComparison ? 'Hide Comparison' : 'Compare Both Regimes'}
              </button>
            </div>

            {showComparison && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">Old Regime</h4>
                  <p>Total Income: {formatCurrency(taxResult.oldRegime.totalIncome)}</p>
                  <p>Deductions: {formatCurrency(taxResult.oldRegime.deductions)}</p>
                  <p>Taxable Income: {formatCurrency(taxResult.oldRegime.taxableIncome)}</p>
                  <p>Tax: {formatCurrency(taxResult.oldRegime.tax)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">New Regime</h4>
                  <p>Total Income: {formatCurrency(taxResult.newRegime.totalIncome)}</p>
                  <p>Deductions: {formatCurrency(taxResult.newRegime.deductions)}</p>
                  <p>Taxable Income: {formatCurrency(taxResult.newRegime.taxableIncome)}</p>
                  <p>Tax: {formatCurrency(taxResult.newRegime.tax)}</p>
                </div>
              </div>
            )}

            {/* Add Advice Component */}
            <Advice taxResult={taxResult} regime={regime} ageGroup={ageGroup} />

            {/* Add PDF Download Button */}
            <div className="mt-4 flex justify-end">
              <TaxReportPDF 
                taxResult={taxResult} 
                regime={regime} 
                ageGroup={ageGroup}
                incomeData={incomeData}
                deductionData={deductionData}
              />
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p>* Includes 4% Health & Education Cess</p>
          <p>* Deduction limits applied automatically in calculations</p>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;