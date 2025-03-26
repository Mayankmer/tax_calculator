import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTaxCalculations } from '../schemas/TaxSchema';
import './History.css';

const History = () => {
    const [calculations, setCalculations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCalculations = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user._id) {
                    navigate('/login');
                    return;
                }
                const data = await getTaxCalculations(user._id);
                
                // Validate and transform the data
                const validCalculations = Array.isArray(data) 
                    ? data.filter(calc => {
                        // Check if all required fields exist
                        return calc && 
                               calc._id && 
                               calc.createdAt && 
                               calc.selectedRegime && 
                               calc.ageGroup && 
                               calc.taxResult && 
                               calc.taxResult[calc.selectedRegime];
                    })
                    : [];
                
                setCalculations(validCalculations);
            } catch (err) {
                console.error('Error fetching calculations:', err);
                setError(err.message || 'Error fetching tax calculations');
                setCalculations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCalculations();
    }, [navigate]);

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (err) {
            console.error('Error formatting date:', err);
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount) => {
        try {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR'
            }).format(Number(amount) || 0);
        } catch (err) {
            console.error('Error formatting currency:', err);
            return '₹0';
        }
    };

    if (loading) {
        return <div className="history-container">Loading...</div>;
    }

    if (error) {
        return <div className="history-container error">{error}</div>;
    }

    if (!Array.isArray(calculations) || calculations.length === 0) {
        return <div className="history-container">No tax calculations found</div>;
    }

    return (
        <div className="history-container">
            <h2>Tax Calculation History</h2>
            <div className="table-container">
                <table className="tax-history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Regime</th>
                            <th>Age Group</th>
                            <th>Total Income</th>
                            <th>Deductions</th>
                            <th>Taxable Income</th>
                            <th>Tax Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calculations.map((calc) => {
                            const selectedRegimeResult = calc.taxResult[calc.selectedRegime];
                            
                            return (
                                <tr key={calc._id}>
                                    <td>{formatDate(calc.createdAt)}</td>
                                    <td>{calc.selectedRegime === 'old' ? 'Old' : 'New'}</td>
                                    <td>
                                        {calc.ageGroup === 'below60' ? 'Below 60' :
                                         calc.ageGroup === 'between60and80' ? '60-80' : 'Above 80'}
                                    </td>
                                    <td>{formatCurrency(selectedRegimeResult.totalIncome)}</td>
                                    <td>{formatCurrency(selectedRegimeResult.deductions)}</td>
                                    <td>{formatCurrency(selectedRegimeResult.taxableIncome)}</td>
                                    <td>{formatCurrency(selectedRegimeResult.tax)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History; 