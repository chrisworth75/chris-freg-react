import axios from 'axios';
import { Fee, CreateFeeRequest } from '../types/Fee';

// Use /api for proxied requests through nginx in Docker
// Use direct connection for local development
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const feeService = {
  // Get all fees
  async getFees(): Promise<Fee[]> {
    try {
      const response = await api.get<Fee[]>('/fees');
      return response.data;
    } catch (error) {
      console.error('Error fetching fees:', error);
      throw error;
    }
  },

  // Get fee by code
  async getFee(code: string): Promise<Fee> {
    try {
      const response = await api.get<Fee>(`/fee/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching fee:', error);
      throw error;
    }
  },

  // Create new fee
  async createFee(fee: CreateFeeRequest): Promise<{ fee: Fee }> {
    try {
      const response = await api.post<{ fee: Fee }>('/fee', fee);
      return response.data;
    } catch (error) {
      console.error('Error creating fee:', error);
      throw error;
    }
  },

  // Reset database (for testing)
  async resetDatabase(): Promise<void> {
    try {
      await api.post('/reset-db');
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  },
};