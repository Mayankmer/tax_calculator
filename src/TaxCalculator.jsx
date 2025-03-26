import React, { useState } from 'react';

const TaxCalculator = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [regime, setRegime] = useState('old');
  const [ageGroup, setAgeGroup] = useState('below60');
  const [taxResult, setTaxResult] = useState(null);
  const [showComparison, setShowComparison] = useState(false);

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

    return tax * 1.04; 
     // Add 4% cess
  };

  const calculateTax = () => {
    const totalIncome = Object.values(incomeData).reduce((sum, val) => sum + val, 0);
    
    // Automatic standard deduction for old regime (₹50,000 if salaried)
    const oldStandardDeduction = incomeData.salaryIncome > 0 ? 50000 : 0;
    const oldDeductions = oldStandardDeduction + Object.values(deductionData).reduce((sum, val) => sum + val, 0);
    
    const newDeductions = 75000;

    const oldTaxable = Math.max(0, totalIncome - oldDeductions);
    const newTaxable = Math.max(0, totalIncome - newDeductions);

    const oldTax = calculateOldRegimeTax(oldTaxable);
    const newTax = calculateNewRegimeTax(newTaxable);

    setTaxResult({
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
    });
    setShowComparison(false);
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
          className="bg-green-500 text-white px-6 py-3 w-full hover:bg-green-600"
        >
          Calculate Tax
        </button>

        {/* Results Section */}
        {taxResult && (
          <div className="mt-8">
            <div className="mb-4 p-4 bg-blue-50 rounded">
              <h3 className="text-lg font-semibold">
                {regime === 'old' ? 'Old' : 'New'} Regime Tax: ₹{taxResult[`${regime}Regime`].tax.toLocaleString()}
              </h3>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="mt-4 text-blue-600 underline"
              >
                {showComparison ? 'Hide Comparison' : 'Compare Both Regimes'}
              </button>
            </div>

            {showComparison && (
              <div className="mt-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Parameter</th>
                      <th className="p-2 border">Old Regime</th>
                      <th className="p-2 border">New Regime</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border">Total Income</td>
                      <td className="p-2 border">₹{taxResult.oldRegime.totalIncome.toLocaleString()}</td>
                      <td className="p-2 border">₹{taxResult.newRegime.totalIncome.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border">Total Deductions</td>
                      <td className="p-2 border">₹{taxResult.oldRegime.deductions.toLocaleString()}</td>
                      <td className="p-2 border">₹{taxResult.newRegime.deductions.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border">Taxable Income</td>
                      <td className="p-2 border">₹{taxResult.oldRegime.taxableIncome.toLocaleString()}</td>
                      <td className="p-2 border">₹{taxResult.newRegime.taxableIncome.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-yellow-50">
                      <td className="p-2 border font-bold">Tax Payable</td>
                      <td className="p-2 border">₹{taxResult.oldRegime.tax.toLocaleString()}</td>
                      <td className="p-2 border">₹{taxResult.newRegime.tax.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 p-3 bg-blue-100 rounded">
                  <p className="font-semibold">
                    {taxResult.oldRegime.tax < taxResult.newRegime.tax
                      ? "Old Regime is more beneficial by ₹" +
                        Math.abs(taxResult.oldRegime.tax - taxResult.newRegime.tax).toLocaleString()
                      : "New Regime is more beneficial by ₹" +
                        Math.abs(taxResult.oldRegime.tax - taxResult.newRegime.tax).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
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