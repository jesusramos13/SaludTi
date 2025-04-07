import axios from 'axios';
import {
  API_BASE_PRESCRIPTION_URL,
  API_PRESCRIPTION_LIST,
  API_PRESCRIPTION_DETAILS,
  API_PRESCRIPTION_MOCK,
  API_PRESCRIPTION_CREATE,
  API_PRESCRIPTION_UPDATE,
  API_PRESCRIPTION_DELETE,
  API_DOCTORS,
  API_PATIENTS,
  API_MEDICINES
} from '../../../helpers/urlHelper';

// Create an axios instance with base configuration
const prescriptionApi = axios.create({
  baseURL: API_BASE_PRESCRIPTION_URL,
});

// Add request interceptor to handle tokens (optional)
prescriptionApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Prescription service
const prescriptionService = {
  // Get all prescriptions
  getAllPrescriptions: async () => {
    try {
      const response = await prescriptionApi.get(API_PRESCRIPTION_LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  },

  // Get mock prescriptions (for testing)
  getMockPrescriptions: async () => {
    try {
      const response = await prescriptionApi.get(API_PRESCRIPTION_MOCK);
      return response.data;
    } catch (error) {
      console.error('Error fetching mock prescriptions:', error);
      throw error;
    }
  },

  // Get a prescription by ID
  getPrescriptionById: async (id) => {
    try {
      const response = await prescriptionApi.get(`${API_PRESCRIPTION_DETAILS}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching prescription with id ${id}:`, error);
      throw error;
    }
  },

  // Create a new prescription
  createPrescription: async (prescriptionData) => {
    try {
      const response = await prescriptionApi.post(API_PRESCRIPTION_CREATE, prescriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  },

  // Update an existing prescription
  updatePrescription: async (id, prescriptionData) => {
    try {
      const response = await prescriptionApi.put(`${API_PRESCRIPTION_UPDATE}/${id}`, prescriptionData);
      return response.data;
    } catch (error) {
      console.error(`Error updating prescription with id ${id}:`, error);
      throw error;
    }
  },

  // Delete a prescription
  deletePrescription: async (id) => {
    try {
      const response = await prescriptionApi.delete(`${API_PRESCRIPTION_DELETE}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting prescription with id ${id}:`, error);
      throw error;
    }
  },

  // Get all doctors
  getAllDoctors: async () => {
    try {
      const response = await prescriptionApi.get(API_DOCTORS);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }
  },

  // Get all patients
  getAllPatients: async () => {
    try {
      const response = await prescriptionApi.get(API_PATIENTS);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get all medicines
  getAllMedicines: async () => {
    try {
      const response = await prescriptionApi.get(API_MEDICINES);
      return response.data;
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw error;
    }
  }
};

export default prescriptionService;