// This file contains the base URL and API endpoints for the application.

// server url
//const SERVER_URL = "http://localhost:3000"; // Replace with your actual server URL
const SERVER_URL = "https://api.intern.saludti.es"; // API url for saludti

// api url
export const API_BASE_URL = 'https://api.intern.saludti.es/api/' // Replace with your actual base URL

// login url
export const API_LOGIN = "/auth/login"; // Replace with your actual login endpoint

// API endpoints for file uploads
export const API_FILE_UPLOAD_SINGLE = "/uploads/single"; // Single file upload endpoint
export const API_FILE_UPLOAD_MULTIPLE = "/uploads/multiple"; // Multiple file upload endpoint

// API endpoints for doctor management


// Prescription-related endpoints
export const API_BASE_PRESCRIPTION_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
export const API_PRESCRIPTION_LIST = '/prescriptions';
export const API_PRESCRIPTION_DETAILS = '/prescriptions'; // + /{id} for specific prescription
export const API_DOCTORS = '/doctors';
export const API_PATIENTS = '/patients';
export const API_MEDICINES = '/medicines';

// Prescription action endpoints
export const API_PRESCRIPTION_MOCK = '/prescriptions/mock'; // For getting mock prescriptions
export const API_PRESCRIPTION_CREATE = '/prescriptions/create'; // For creating new prescriptions
export const API_PRESCRIPTION_UPDATE = '/prescriptions/update'; // + /{id} for updating a specific prescription
export const API_PRESCRIPTION_DELETE = '/prescriptions/delete'; // + /{id} for deleting a specific prescription

export const API_DOCTOR_LIST = "/users?role=doctor"; // Replace with your actual doctor list endpoint
export const API_DOCTOR_CREATE = "/users/create"; // Replace with your actual doctor create endpoint
export const API_DOCTOR_UPDATE = "/users/update"; // Replace with your actual doctor update endpoint  
export const API_DOCTOR_DELETE = "/users/delete"; // Replace with your actual doctor delete endpoint

export const API_PATIENT_LIST = "/users?role=patient"; // Replace with your actual doctor list endpoint
export const API_PATIENT_CREATE = "/users/create"; // Replace with your actual doctor create endpoint
export const API_PATIENT_UPDATE = "/users/update"; // Replace with your actual doctor update endpoint
export const API_PATIENT_DELETE = "/user/:id";
