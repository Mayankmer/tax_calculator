import React from 'react';
import jsPDF from 'jspdf';

const TaxReportPDF = ({ taxResult, regime, ageGroup, incomeData, deductionData }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 10;

    // Set font to Arial
    doc.setFont('helvetica', 'normal');

    // Title
    doc.setFontSize(18);
    doc.text('Tax Calculation Report', pageWidth / 2, margin, { align: 'left' });
    doc.setFontSize(12);

    let yPos = margin + 20;

    // Basic Information
    doc.setFontSize(14);
    doc.text('Basic Information', margin, yPos);
    doc.setFontSize(12);
    yPos += lineHeight * 2;
    doc.text(`Tax Regime: ${regime === 'old' ? 'Old Regime' : 'New Regime'}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Age Group: ${ageGroup === 'below60' ? 'Below 60 years' : 
              ageGroup === 'between60and80' ? '60-80 years' : 'Above 80 years'}`, margin, yPos);
    yPos += lineHeight * 2;

    // Income Details
    doc.setFontSize(14);
    doc.text('Income Details', margin, yPos);
    doc.setFontSize(12);
    yPos += lineHeight * 2;
    Object.entries(incomeData).forEach(([key, value]) => {
      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      doc.text(`${formattedKey}: Rs.${value.toLocaleString()}`, margin, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Deductions (Old Regime only)
    if (regime === 'old') {
      doc.setFontSize(14);
      doc.text('Deductions', margin, yPos);
      doc.setFontSize(12);
      yPos += lineHeight * 2;
      Object.entries(deductionData).forEach(([key, value]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        doc.text(`${formattedKey}: Rs.${value.toLocaleString()}`, margin, yPos);
        yPos += lineHeight;
      });
      yPos += lineHeight;
    }

    // Tax Results
    doc.setFontSize(14);
    doc.text('Tax Calculation Results', margin, yPos);
    doc.setFontSize(12);
    yPos += lineHeight * 2;

    // Check if we need a new page
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = margin;
    }

    const currentRegime = regime === 'old' ? taxResult.oldRegime : taxResult.newRegime;
    doc.text(`Total Income: Rs.${currentRegime.totalIncome.toLocaleString()}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Total Deductions: Rs.${currentRegime.deductions.toLocaleString()}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Taxable Income: Rs.${currentRegime.taxableIncome.toLocaleString()}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Tax Payable: Rs.${currentRegime.tax.toLocaleString()}`, margin, yPos);
    yPos += lineHeight * 2;

    // Comparison
    doc.setFontSize(14);
    doc.text('Regime Comparison', margin, yPos);
    doc.setFontSize(12);
    yPos += lineHeight * 2;

    // Check if we need a new page
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = margin;
    }

    doc.text(`Old Regime Tax: Rs.${taxResult.oldRegime.tax.toLocaleString()}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`New Regime Tax: Rs.${taxResult.newRegime.tax.toLocaleString()}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Recommended Regime: ${taxResult.oldRegime.tax < taxResult.newRegime.tax ? 'Old Regime' : 'New Regime'}`, margin, yPos);
    yPos += lineHeight * 2;

    // Footer
    doc.setFontSize(10);
    doc.text('* Includes 4% Health & Education Cess', margin, pageHeight - 20);
    doc.text('* This is a computer-generated report', margin, pageHeight - 15);

    // Save the PDF
    doc.save('tax-calculation-report.pdf');
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
      Download PDF Report
    </button>
  );
};

export default TaxReportPDF; 