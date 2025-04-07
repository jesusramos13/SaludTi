import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../helpers/urlHelper';

const PrescriptionSave = ({ prescription, isEdit, onClose, onSave }) => {
  const initialFormState = {
    id: '',
    doctorId: '',
    patientId: '',
    medicineId: '',
    dosage: '',
    datePrescribed: new Date().toISOString().split('T')[0],
    refills: '',
    instructions: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);

  // Fetch related data when component mounts
  useEffect(() => {
    fetchRelatedData();
    
    // If editing, populate form with prescription data
    if (isEdit && prescription) {
      setFormData({
        id: prescription.id || '',
        doctorId: prescription.doctorId || '',
        patientId: prescription.patientId || '',
        medicineId: prescription.medicineId || '',
        dosage: prescription.dosage || '',
        datePrescribed: prescription.datePrescribed || new Date().toISOString().split('T')[0],
        refills: prescription.refills || '',
        instructions: prescription.instructions || ''
      });
    }
  }, [isEdit, prescription]);

  // Fetch doctors, patients, and medicines for dropdowns
  const fetchRelatedData = async () => {
    try {
      // These would be replaced with your actual API endpoints
      const [doctorsRes, patientsRes, medicinesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/doctors`),
        axios.get(`${API_BASE_URL}/patients`),
        axios.get(`${API_BASE_URL}/medicines`)
      ]);
      
      setDoctors(doctorsRes.data.data || []);
      setPatients(patientsRes.data.data || []);
      setMedicines(medicinesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.doctorId) newErrors.doctorId = 'Doctor is required';
    if (!formData.patientId) newErrors.patientId = 'Patient is required';
    if (!formData.medicineId) newErrors.medicineId = 'Medicine is required';
    if (!formData.dosage) newErrors.dosage = 'Dosage is required';
    if (!formData.datePrescribed) newErrors.datePrescribed = 'Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isEdit) {
        // Update existing prescription
        await axios.put(`${API_BASE_URL}/prescriptions/${formData.id}`, formData);
      } else {
        // Create new prescription
        await axios.post(`${API_BASE_URL}/prescriptions`, formData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving prescription:', error);
      // Handle API errors
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'Failed to save prescription. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors.general && (
        <div className="alert alert-danger">{errors.general}</div>
      )}
      
      <div className="mb-3">
        <label htmlFor="doctorId" className="form-label">Doctor</label>
        <select
          id="doctorId"
          name="doctorId"
          className={`form-select ${errors.doctorId ? 'is-invalid' : ''}`}
          value={formData.doctorId}
          onChange={handleChange}
        >
          <option value="">Select Doctor</option>
          {doctors.map(doctor => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.name} {doctor.surname} ({doctor.id})
            </option>
          ))}
        </select>
        {errors.doctorId && <div className="invalid-feedback">{errors.doctorId}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="patientId" className="form-label">Patient</label>
        <select
          id="patientId"
          name="patientId"
          className={`form-select ${errors.patientId ? 'is-invalid' : ''}`}
          value={formData.patientId}
          onChange={handleChange}
        >
          <option value="">Select Patient</option>
          {patients.map(patient => (
            <option key={patient.id} value={patient.id}>
              {patient.name} {patient.surname} ({patient.id})
            </option>
          ))}
        </select>
        {errors.patientId && <div className="invalid-feedback">{errors.patientId}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="medicineId" className="form-label">Medicine</label>
        <select
          id="medicineId"
          name="medicineId"
          className={`form-select ${errors.medicineId ? 'is-invalid' : ''}`}
          value={formData.medicineId}
          onChange={handleChange}
        >
          <option value="">Select Medicine</option>
          {medicines.map(medicine => (
            <option key={medicine.id} value={medicine.id}>
              {medicine.name} ({medicine.id})
            </option>
          ))}
        </select>
        {errors.medicineId && <div className="invalid-feedback">{errors.medicineId}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="dosage" className="form-label">Dosage</label>
        <input
          type="text"
          id="dosage"
          name="dosage"
          className={`form-control ${errors.dosage ? 'is-invalid' : ''}`}
          value={formData.dosage}
          onChange={handleChange}
        />
        {errors.dosage && <div className="invalid-feedback">{errors.dosage}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="datePrescribed" className="form-label">Date Prescribed</label>
        <input
          type="date"
          id="datePrescribed"
          name="datePrescribed"
          className={`form-control ${errors.datePrescribed ? 'is-invalid' : ''}`}
          value={formData.datePrescribed}
          onChange={handleChange}
        />
        {errors.datePrescribed && <div className="invalid-feedback">{errors.datePrescribed}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="refills" className="form-label">Refills</label>
        <input
          type="number"
          id="refills"
          name="refills"
          className={`form-control ${errors.refills ? 'is-invalid' : ''}`}
          value={formData.refills}
          onChange={handleChange}
          min="0"
        />
        {errors.refills && <div className="invalid-feedback">{errors.refills}</div>}
      </div>
      
      <div className="mb-3">
        <label htmlFor="instructions" className="form-label">Instructions</label>
        <textarea
          id="instructions"
          name="instructions"
          className={`form-control ${errors.instructions ? 'is-invalid' : ''}`}
          value={formData.instructions}
          onChange={handleChange}
          rows="4"
        ></textarea>
        {errors.instructions && <div className="invalid-feedback">{errors.instructions}</div>}
      </div>
      
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            isEdit ? 'Update Prescription' : 'Create Prescription'
          )}
        </button>
      </div>
    </form>
  );
};

export default PrescriptionSave;