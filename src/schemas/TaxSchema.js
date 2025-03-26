import { z } from 'zod';
import axios from 'axios';

// Tax Calculation Schema
export const taxCalculationSchema = z.object({
  // Basic Information
  userId: z.string().min(1, "User ID is required"), // MongoDB ObjectId
  ageGroup: z.enum(['below60', 'between60and80', 'above80']),
  selectedRegime: z.enum(['old', 'new']),

  // Income Details
  incomeData: z.object({
    salaryIncome: z.number().min(0).default(0),
    interestIncome: z.number().min(0).default(0),
    rentalIncome: z.number().min(0).default(0),
    capitalGains: z.number().min(0).default(0),
    otherIncome: z.number().min(0).default(0)
  }),

  // Deductions (Old Regime)
  deductionData: z.object({
    section80C: z.number().min(0).max(150000).default(0),
    section80D: z.number().min(0).default(0),
    section24: z.number().min(0).default(0),
    section80CCD: z.number().min(0).default(0),
    section80G: z.number().min(0).default(0),
    section80E: z.number().min(0).default(0),
    section80TTA: z.number().min(0).default(0)
  }),

  // Tax Calculation Results
  taxResult: z.object({
    oldRegime: z.object({
      totalIncome: z.number().min(0).default(0),
      deductions: z.number().min(0).default(0),
      taxableIncome: z.number().min(0).default(0),
      tax: z.number().min(0).default(0)
    }),
    newRegime: z.object({
      totalIncome: z.number().min(0).default(0),
      deductions: z.number().min(0).default(0),
      taxableIncome: z.number().min(0).default(0),
      tax: z.number().min(0).default(0)
    })
  })
});

// API Functions
export const saveTaxCalculation = async (data) => {
  try {
    // Validate data against schema
    const validatedData = taxCalculationSchema.parse(data);
    
    const response = await axios.post('/api/tax/save', validatedData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.message || 'Error saving tax calculation');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Error setting up the request: ' + error.message);
    }
  }
};

export const getTaxCalculations = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const response = await axios.get(`/api/tax/user/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error fetching tax calculations');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error('Error setting up the request: ' + error.message);
    }
  }
}; 