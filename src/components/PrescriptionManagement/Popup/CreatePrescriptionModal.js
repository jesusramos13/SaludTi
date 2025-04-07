import React, { useState, useRef, useEffect } from "react";
import { BsTrash, BsPencil } from "react-icons/bs";
import prescriptionService from '../services/prescriptionService';

const CreatePrescriptionModal = () => {
  const modalCloseRef = useRef(null);

  // State for doctors, patients, medicines and diseases
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Empty initial state for new prescriptions
  const emptyPrescriptionState = {
    patientName: '',
    patientId: '',
    doctorId: '',
    consultationType: '',
    problems: '',
    findings: [],
    medications: []
  };

  const initialFindingState = {
    name: '',
    value: '',
    type: '',
    instruction: ''
  };

  const initialMedicationState = {
    name: '',
    medicineId: '',
    quantity: '',
    frequency: '',
    duration: '',
    instructions: ''
  };

  const [prescription, setPrescription] = useState(emptyPrescriptionState);
  const [finding, setFinding] = useState(initialFindingState);
  const [medication, setMedication] = useState(initialMedicationState);
  const [editingFindingId, setEditingFindingId] = useState(null);
  const [editingMedicationId, setEditingMedicationId] = useState(null);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from API
        const [doctorsData, patientsData, medicinesData] = await Promise.all([
          prescriptionService.getAllDoctors(),
          prescriptionService.getAllPatients(),
          prescriptionService.getAllMedicines()
        ]);
        
        // Set data to state
        setDoctors(doctorsData?.data || MOCK_DOCTORS);
        setPatients(patientsData?.data || MOCK_PATIENTS);
        setMedicines(medicinesData?.data || MOCK_MEDICINES);
        
        // Use mock data for diseases since there's no API endpoint for it
        setDiseases(MOCK_DISEASES);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load form data. Using mock data instead.');
        
        // Fallback to mock data
        setDoctors(MOCK_DOCTORS);
        setPatients(MOCK_PATIENTS);
        setMedicines(MOCK_MEDICINES);
        setDiseases(MOCK_DISEASES);
        
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPrescription(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDiseaseChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setSelectedDiseases(prev => [...prev, value]);
    } else {
      setSelectedDiseases(prev => prev.filter(id => id !== value));
    }
  };

  const addFinding = () => {
    if (finding.name && finding.type) {
      if (editingFindingId !== null) {
        // Update existing finding
        setPrescription(prev => ({
          ...prev,
          findings: prev.findings.map(f => 
            f.id === editingFindingId ? { ...finding, id: editingFindingId } : f
          )
        }));
        setEditingFindingId(null);
      } else {
        // Add new finding
        setPrescription(prev => ({
          ...prev,
          findings: [...prev.findings, { ...finding, id: Date.now() }]
        }));
      }
      setFinding(initialFindingState);
    } else {
      alert('Please complete at least the name and type of the test');
    }
  };

  const editFinding = (id) => {
    const findingToEdit = prescription.findings.find(f => f.id === id);
    if (findingToEdit) {
      setFinding(findingToEdit);
      setEditingFindingId(id);
    }
  };

  const removeFinding = (id) => {
    setPrescription(prev => ({
      ...prev,
      findings: prev.findings.filter(f => f.id !== id)
    }));
    if (editingFindingId === id) {
      setFinding(initialFindingState);
      setEditingFindingId(null);
    }
  };

  const addMedication = () => {
    if (medication.name && medication.quantity && medication.instructions) {
      if (editingMedicationId !== null) {
        // Update existing medication
        setPrescription(prev => ({
          ...prev,
          medications: prev.medications.map(m => 
            m.id === editingMedicationId ? { ...medication, id: editingMedicationId } : m
          )
        }));
        setEditingMedicationId(null);
      } else {
        // Add new medication
        setPrescription(prev => ({
          ...prev,
          medications: [...prev.medications, { ...medication, id: Date.now() }]
        }));
      }
      setMedication(initialMedicationState);
    } else {
      alert('Please complete all medication fields');
    }
  };

  const editMedication = (id) => {
    const medicationToEdit = prescription.medications.find(m => m.id === id);
    if (medicationToEdit) {
      setMedication(medicationToEdit);
      setEditingMedicationId(id);
    }
  };

  const removeMedication = (id) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m.id !== id)
    }));
    if (editingMedicationId === id) {
      setMedication(initialMedicationState);
      setEditingMedicationId(null);
    }
  };

  // Reset form to empty state
  const resetModal = () => {
    setPrescription(emptyPrescriptionState);
    setFinding(initialFindingState);
    setMedication(initialMedicationState);
    setEditingFindingId(null);
    setEditingMedicationId(null);
    setSelectedDiseases([]);
    setError(null);
    setSuccessMessage(null);
  };

  const validateForm = () => {
    if (!prescription.patientId) {
      setError('Please select a patient');
      return false;
    }
    if (!prescription.doctorId) {
      setError('Please select a doctor');
      return false;
    }
    // Validate that at least one medication or test is added
    if (prescription.medications.length === 0 && prescription.findings.length === 0) {
      setError('Please add at least one medication or test');
      return false;
    }
    return true;
  };

  const savePrescription = async () => {
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Transform data to the format required by the API
      const prescriptionData = {
        doctor: prescription.doctorId,
        patient: prescription.patientId,
        consultationType: prescription.consultationType || "Regular",
        symptoms: prescription.problems || '',
        diseases: selectedDiseases,
        prescribeMedicine: prescription.medications.map(med => ({
          medicine: med.medicineId,
          dose: med.quantity,
          frequency: med.frequency || '',
          duration: med.duration || '',
          instruction: med.instructions
        })),
        prescribeTests: prescription.findings.map(test => ({
          name: test.name,
          type: test.type,
          instruction: test.instruction || ''
        }))
      };
      
      // Log the data being sent for debugging
      console.log('Sending prescription data:', JSON.stringify(prescriptionData, null, 2));
      
      // Call the API to create the prescription
      const response = await prescriptionService.createPrescription(prescriptionData);
      
      console.log('Prescription created successfully:', response);
      
      // Show success message
      setSuccessMessage('Prescription successfully created!');
      
      // Wait a moment before closing the modal and refreshing the page
      setTimeout(() => {
        if (modalCloseRef.current) {
          modalCloseRef.current.click();
        }
        // Refresh the page to update KPIs
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.error('Error creating prescription:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Display appropriate error message
      if (error.response?.data?.message) {
        setError(`Error: ${error.response.data.message}`);
      } else if (error.message) {
        setError(`Error: ${error.message}`);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to find a medicine by ID and get its name
  const getMedicineName = (id) => {
    const medicine = medicines.find(m => m._id === id);
    return medicine ? medicine.name : 'Unknown';
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        data-bs-toggle="modal"
        data-bs-target="#prescriptionModal"
        onClick={resetModal}
      >
        + Add New
      </button>

      <div
        className="modal fade"
        id="prescriptionModal"
        tabIndex="-1"
        aria-labelledby="prescriptionTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title" id="prescriptionTitle">
                Create Prescription
              </h3>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                ref={modalCloseRef}
              ></button>
            </div>
            <div className="modal-body">
              {loading && (
                <div className="d-flex justify-content-center my-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              
              <h4 className="modal-title" id="prescriptionSubtitle">
                Basic Details
              </h4>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="patientId" className="form-label">
                    Patient
                  </label>
                  <select
                    className="form-select"
                    id="patientId"
                    name="patientId"
                    value={prescription.patientId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select patient</option>
                    {patients.map(patient => (
                      <option key={patient._id} value={patient._id}>
                        {patient.name} {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="doctorId" className="form-label">
                    Doctor
                  </label>
                  <select
                    className="form-select"
                    id="doctorId"
                    name="doctorId"
                    value={prescription.doctorId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.name} {doctor.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="consultationType" className="form-label">
                    Consultation Type
                  </label>
                  <select
                    className="form-select"
                    id="consultationType"
                    name="consultationType"
                    value={prescription.consultationType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select type</option>
                    <option value="Regular">Regular</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <h4>Symptoms</h4>
                <label htmlFor="problems" className="form-label">
                  Problems Patient Facing
                </label>
                <textarea
                  className="form-control"
                  id="problems"
                  name="problems"
                  value={prescription.problems}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter symptoms"
                ></textarea>
              </div>

              <div className="mb-3">
                <h4>Diseases</h4>
                <div className="row">
                  {diseases.map(disease => (
                    <div key={disease._id} className="col-md-4 mb-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`disease-${disease._id}`}
                          value={disease._id}
                          checked={selectedDiseases.includes(disease._id)}
                          onChange={handleDiseaseChange}
                        />
                        <label className="form-check-label" htmlFor={`disease-${disease._id}`}>
                          {disease.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="row mb-3">
                <h4>Medical Tests</h4>
                <div className="col-md-3">
                  <label htmlFor="findingName" className="form-label">
                    Test Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="findingName"
                    placeholder="Test name"
                    value={finding.name}
                    onChange={(e) => setFinding(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="findingType" className="form-label">
                    Type
                  </label>
                  <select
                    className="form-select"
                    id="findingType"
                    value={finding.type}
                    onChange={(e) => setFinding(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="">Select type</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Imaging">Imaging</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label htmlFor="findingInstruction" className="form-label">
                    Instructions
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="findingInstruction"
                    placeholder="Test instructions"
                    value={finding.instruction || ''}
                    onChange={(e) => setFinding(prev => ({ ...prev, instruction: e.target.value }))}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <button 
                    className="btn btn-primary w-100" 
                    onClick={addFinding}
                  >
                    {editingFindingId !== null ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>

              {prescription.findings.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped text-center">
                    <thead className="table-info">
                      <tr>
                        <th>Test Name</th>
                        <th>Type</th>
                        <th>Instructions</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescription.findings.map((f) => (
                        <tr key={f.id}>
                          <td>{f.name}</td>
                          <td>{f.type}</td>
                          <td>{f.instruction || '-'}</td>
                          <td className="text-center">
                            <button 
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => editFinding(f.id)}
                            >
                              <BsPencil />
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => removeFinding(f.id)}
                            >
                              <BsTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="row mb-3 mt-4">
                <h4>Medicine</h4>
                <div className="col-md-4">
                  <label htmlFor="medicineId" className="form-label">
                    Medicine
                  </label>
                  <select
                    className="form-select"
                    id="medicineId"
                    value={medication.medicineId || ''}
                    onChange={(e) => {
                      const medicineId = e.target.value;
                      const medicineName = getMedicineName(medicineId);
                      setMedication(prev => ({ 
                        ...prev, 
                        medicineId: medicineId,
                        name: medicineName
                      }));
                    }}
                  >
                    <option value="">Select medicine</option>
                    {medicines.map(medicine => (
                      <option key={medicine._id} value={medicine._id}>
                        {medicine.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor="medicationQuantity" className="form-label">
                    Dose
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="medicationQuantity"
                    placeholder="e.g. 500mg"
                    value={medication.quantity}
                    onChange={(e) => setMedication(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="medicationFrequency" className="form-label">
                    Frequency
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="medicationFrequency"
                    placeholder="e.g. Every 8h"
                    value={medication.frequency || ''}
                    onChange={(e) => setMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="medicationDuration" className="form-label">
                    Duration
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="medicationDuration"
                    placeholder="e.g. 7 days"
                    value={medication.duration || ''}
                    onChange={(e) => setMedication(prev => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="row mb-3">
                <div className="col-md-9">
                  <label htmlFor="medicationInstructions" className="form-label">
                    Instructions
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="medicationInstructions"
                    placeholder="Instructions"
                    value={medication.instructions}
                    onChange={(e) => setMedication(prev => ({ ...prev, instructions: e.target.value }))}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">&nbsp;</label>
                  <button 
                    className="btn btn-primary w-100" 
                    onClick={addMedication}
                  >
                    {editingMedicationId !== null ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>

              {prescription.medications.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-striped text-center">
                    <thead className="table-info">
                      <tr>
                        <th>Medicine</th>
                        <th>Dose</th>
                        <th>Frequency</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescription.medications.map((m) => (
                        <tr key={m.id}>
                          <td>{m.name}</td>
                          <td>{m.quantity}</td>
                          <td>{m.frequency || '-'}</td>
                          <td>{m.duration || '-'}</td>
                          <td>{m.instructions}</td>
                          <td className="text-center">
                            <button 
                              className="btn btn-warning btn-sm me-2"
                              onClick={() => editMedication(m.id)}
                            >
                              <BsPencil />
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => removeMedication(m.id)}
                            >
                              <BsTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={savePrescription}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Prescription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Keep the mock data for fallback
const MOCK_DOCTORS = [
  { _id: "9327c5bde12e5b2f24a5d9b0", name: "Alice", lastName: "Cooper", specialty: "General Medicine" },
  { _id: "9327c5ade12e5b2f24a5d9a1", name: "Emma", lastName: "Johnson", specialty: "Cardiology" },
  { _id: "9327c5ade12e5b2f24a5d9a2", name: "Michael", lastName: "Brown", specialty: "Pediatrics" },
  { _id: "9327c5ade12e5b2f24a5d9a3", name: "Sarah", lastName: "Davis", specialty: "Neurology" },
  { _id: "9327c5ade12e5b2f24a5d9a4", name: "Robert", lastName: "Wilson", specialty: "Dermatology" },
  { _id: "9327c5ade12e5b2f24a5d9a5", name: "Lisa", lastName: "Taylor", specialty: "Gynecology" },
  { _id: "9327c5ade12e5b2f24a5d9a6", name: "David", lastName: "Martinez", specialty: "Orthopedics" },
  { _id: "9327c5ade12e5b2f24a5d9a7", name: "Jennifer", lastName: "Anderson", specialty: "Ophthalmology" },
  { _id: "9327c5ade12e5b2f24a5d9a8", name: "Thomas", lastName: "Garcia", specialty: "Psychiatry" },
  { _id: "9327c5ade12e5b2f24a5d9a9", name: "Jessica", lastName: "Harris", specialty: "Oncology" }
];

const MOCK_PATIENTS = [
  { _id: "9327c5bde12e5b2f24a5d9b0", name: "Alice", lastName: "Cooper", age: 32, gender: "Female" },
  { _id: "9327c5bde12e5b2f24a5d9b1", name: "Bob", lastName: "Miller", age: 45, gender: "Male" },
  { _id: "9327c5bde12e5b2f24a5d9b2", name: "Carol", lastName: "White", age: 28, gender: "Female" },
  { _id: "9327c5bde12e5b2f24a5d9b3", name: "Daniel", lastName: "Thompson", age: 50, gender: "Male" },
  { _id: "9327c5e5e12e5b2f24a5d9b4", name: "Eva", lastName: "Rodriguez", age: 37, gender: "Female" },
  { _id: "9327c5e5e12e5b2f24a5d9b5", name: "Frank", lastName: "Lee", age: 65, gender: "Male" },
  { _id: "9327c5e5e12e5b2f24a5d9b6", name: "Grace", lastName: "Walker", age: 22, gender: "Female" },
  { _id: "9327c5e5e12e5b2f24a5d9b7", name: "Henry", lastName: "Allen", age: 41, gender: "Male" },
  { _id: "9327c5e5e12e5b2f24a5d9b8", name: "Irene", lastName: "Young", age: 33, gender: "Female" },
  { _id: "9327c5e5e12e5b2f24a5d9b9", name: "Jack", lastName: "King", age: 56, gender: "Male" }
];

const MOCK_MEDICINES = [
  { _id: "9927c625e12e5b2f24a5d9bA", name: "Paracetamol", category: "Analgesic", dosageForm: "Tablet" },
  { _id: "9927c625e12e5b2f24a5d9bB", name: "Ibuprofen", category: "Anti-inflammatory", dosageForm: "Tablet" },
  { _id: "9927c625e12e5b2f24a5d9bC", name: "Amoxicillin", category: "Antibiotic", dosageForm: "Capsule" },
  { _id: "9927c625e12e5b2f24a5d9bD", name: "Loratadine", category: "Antihistamine", dosageForm: "Tablet" },
  { _id: "9927c625e12e5b2f24a5d9bE", name: "Omeprazole", category: "Proton Pump Inhibitor", dosageForm: "Capsule" },
  { _id: "9927c625e12e5b2f24a5d9bF", name: "Salbutamol", category: "Bronchodilator", dosageForm: "Inhaler" },
  { _id: "9927c625e12e5b2f24a5d9c0", name: "Metformin", category: "Antidiabetic", dosageForm: "Tablet" },
  { _id: "9927c625e12e5b2f24a5d9c1", name: "Atorvastatin", category: "Statin", dosageForm: "Tablet" },
  { _id: "9927c625e12e5b2f24a5d9c2", name: "Amlodipine", category: "Calcium Channel Blocker", dosageForm: "Tablet" },
  { _id: "9927c625e12e5b2f24a5d9c3", name: "Sertraline", category: "Antidepressant", dosageForm: "Tablet" }
];

const MOCK_DISEASES = [
  { _id: "9927c600e12e5b2f24a5d9bA", name: "Hypertension", category: "Cardiovascular" },
  { _id: "9927c600e12e5b2f24a5d9bB", name: "Type 2 Diabetes", category: "Endocrine" },
  { _id: "9927c600e12e5b2f24a5d9bC", name: "Asthma", category: "Respiratory" },
  { _id: "9927c600e12e5b2f24a5d9bD", name: "Migraine", category: "Neurological" },
  { _id: "9927c600e12e5b2f24a5d9bE", name: "Gastritis", category: "Gastrointestinal" },
  { _id: "9927c600e12e5b2f24a5d9bF", name: "Osteoarthritis", category: "Musculoskeletal" },
  { _id: "9927c600e12e5b2f24a5d9c0", name: "Hypothyroidism", category: "Endocrine" },
  { _id: "9927c600e12e5b2f24a5d9c1", name: "Allergic Rhinitis", category: "Immunological" },
  { _id: "9927c600e12e5b2f24a5d9c2", name: "Depression", category: "Psychological" },
  { _id: "9927c600e12e5b2f24a5d9c3", name: "Eczema", category: "Dermatological" }
];

export default CreatePrescriptionModal;