import React from 'react';

const Advice = ({ taxResult, regime, ageGroup }) => {
  if (!taxResult) return null;

  const { oldRegime, newRegime } = taxResult;
  const currentRegime = regime === 'old' ? oldRegime : newRegime;
  const isOldRegimeBetter = oldRegime.tax < newRegime.tax;

  const getAdvice = () => {
    const advice = [];

    // Regime-specific advice
    if (isOldRegimeBetter) {
      advice.push({
        type: 'regime',
        message: `You can save ₹${Math.abs(oldRegime.tax - newRegime.tax).toLocaleString()} by switching to the Old Regime.`,
        priority: 'high'
      });
    }

    // Income-based advice
    if (currentRegime.taxableIncome > 500000) {
      advice.push({
        type: 'income',
        message: 'Consider investing in tax-saving instruments to reduce your taxable income.',
        priority: 'medium'
      });
    }

    // Deduction-based advice (for old regime)
    if (regime === 'old') {
      const totalDeductions = Object.values(currentRegime.deductions).reduce((sum, val) => sum + val, 0);
      if (totalDeductions < 150000) {
        advice.push({
          type: 'deductions',
          message: 'You can claim more deductions under Section 80C (up to ₹1.5L) to reduce your tax liability.',
          priority: 'high'
        });
      }
    }

    // Age-specific advice
    if (ageGroup === 'below60' && currentRegime.taxableIncome > 500000) {
      advice.push({
        type: 'age',
        message: 'Consider investing in a pension scheme (NPS) for additional tax benefits under Section 80CCD.',
        priority: 'medium'
      });
    }

    // Health insurance advice
    if (regime === 'old' && currentRegime.deductions.section80D < 25000) {
      advice.push({
        type: 'health',
        message: 'Consider purchasing health insurance to claim deductions under Section 80D (up to ₹25,000).',
        priority: 'medium'
      });
    }

    // Home loan advice
    if (regime === 'old' && currentRegime.deductions.section24 < 200000) {
      advice.push({
        type: 'home',
        message: 'If you have a home loan, you can claim up to ₹2L deduction under Section 24(b).',
        priority: 'medium'
      });
    }

    return advice;
  };

  const adviceList = getAdvice();

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-blue-600 mb-4">Tax-Saving Advice</h3>
      
      {adviceList.length === 0 ? (
        <p className="text-gray-600">No specific advice available at this time.</p>
      ) : (
        <div className="space-y-4">
          {adviceList.map((advice, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg ${
                advice.priority === 'high' 
                  ? 'bg-red-50 border-l-4 border-red-500' 
                  : 'bg-blue-50 border-l-4 border-blue-500'
              }`}
            >
              <p className="text-gray-800">{advice.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">General Tips:</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Keep track of all your investments and expenses for tax purposes</li>
          <li>Consider consulting a tax professional for personalized advice</li>
          <li>Review your tax-saving investments annually</li>
          <li>Stay updated with the latest tax rules and regulations</li>
        </ul>
      </div>
    </div>
  );
};

export default Advice; 