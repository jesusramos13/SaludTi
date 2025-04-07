import React, { useState, useEffect } from 'react';
import prescriptionService from '../services/prescriptionService';

const ViewDetailPrescription = ({ prescription, onEdit, onUpdateSuccess }) => {
  // State for controlling form-wide editing
  const [isEditingAll, setIsEditingAll] = useState(prescription?.initialEditMode || false);
  // State for temporary values during editing
  const [tempValues, setTempValues] = useState({});
  // State for storing original values before editing
  const [originalValues, setOriginalValues] = useState({});
  // State for controlling if confirmation modal is visible
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // State for storing changes made
  const [changes, setChanges] = useState({});
  // State for medications list
  const [medications, setMedications] = useState([]);
  // State for new medication form
  const [showNewMedForm, setShowNewMedForm] = useState(false);
  // State for new medication
  const [newMedication, setNewMedication] = useState({
    medicineId: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  });
  // State for loading and error handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize temporary values and medications when prescription changes or edit mode changes
  useEffect(() => {
    if ((isEditingAll || prescription?.initialEditMode) && prescription) {
      setTempValues({...prescription});
      setOriginalValues({...prescription});
      
      // Initialize medications list - if it's an array use it, otherwise create an array with single item
      const initialMedications = Array.isArray(prescription.medications) 
        ? [...prescription.medications] 
        : [{
            medicineId: prescription.medicineId || '',
            dosage: prescription.dosage || '',
            frequency: prescription.frequency || '',
            duration: prescription.duration || '',
            instructions: prescription.instructions || ''
          }];
      
      setMedications(initialMedications);
      
      // If initialEditMode is true, make sure isEditingAll is also true
      if (prescription.initialEditMode && !isEditingAll) {
        setIsEditingAll(true);
      }
    }
  }, [isEditingAll, prescription]);

  // If no prescription, show a placeholder
  if (!prescription) return <div className="alert alert-info">No prescription selected</div>;

  // Handle input change during editing
  const handleInputChange = (e, fieldName) => {
    setTempValues({
      ...tempValues,
      [fieldName]: e.target.value
    });
  };

  // Handle medication input change
  const handleMedicationChange = (e, index, field) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = e.target.value;
    setMedications(updatedMedications);
  };

  // Handle new medication input change
  const handleNewMedicationChange = (e, field) => {
    setNewMedication({
      ...newMedication,
      [field]: e.target.value
    });
  };

  // Add new medication to the list
  const handleAddMedication = () => {
    // Validate required fields
    if (!newMedication.medicineId) {
      alert("Medicine ID is required");
      return;
    }
    
    setMedications([...medications, {...newMedication}]);
    setShowNewMedForm(false);
    setNewMedication({
      medicineId: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
  };

  // Remove medication from the list
  const handleRemoveMedication = (index) => {
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };

  // Handle editing all fields
  const handleEditAll = () => {
    setIsEditingAll(true);
    setTempValues({...prescription});
    setOriginalValues({...prescription});
  };

  // Handle saving all changes
  const handleSaveAll = () => {
    // Create updated prescription with medications
    const updatedPrescription = {
      ...tempValues,
      medications: medications
    };
    
    // If there's only one medication and no array existed before, also save at top level for backward compatibility
    if (medications.length === 1) {
      updatedPrescription.medicineId = medications[0].medicineId;
      updatedPrescription.dosage = medications[0].dosage;
      updatedPrescription.frequency = medications[0].frequency;
      updatedPrescription.duration = medications[0].duration;
      updatedPrescription.instructions = medications[0].instructions;
    }
    
    // Calculate changes for regular fields
    const newChanges = {};
    
    Object.keys(tempValues).forEach(key => {
      if (originalValues[key] !== tempValues[key]) {
        newChanges[key] = {
          oldValue: originalValues[key] || 'N/A',
          newValue: tempValues[key]
        };
      }
    });
    
    // Add medication changes
    if (!Array.isArray(prescription.medications) && medications.length > 1) {
      newChanges.medications = {
        oldValue: "1 medication",
        newValue: `${medications.length} medications`
      };
    } else if (Array.isArray(prescription.medications) && 
              prescription.medications.length !== medications.length) {
      newChanges.medications = {
        oldValue: `${prescription.medications.length} medications`,
        newValue: `${medications.length} medications`
      };
    }
    
    setChanges(newChanges);
    
    // Show modal if there are changes
    if (Object.keys(newChanges).length > 0 || 
        medications.length !== (Array.isArray(prescription.medications) ? 
                               prescription.medications.length : 1)) {
      setShowConfirmModal(true);
    } else {
      setIsEditingAll(false);
    }
  };

  // Confirm all changes
  const handleConfirmChanges = async () => {
    if (!prescription.id) {
      console.error("No prescription ID found");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create updated prescription with medications
      const updatedPrescription = {
        ...tempValues,
        medications: medications
      };
      
      // If there's only one medication and no array existed before, also save at top level
      if (medications.length === 1) {
        updatedPrescription.medicineId = medications[0].medicineId;
        updatedPrescription.dosage = medications[0].dosage;
        updatedPrescription.frequency = medications[0].frequency;
        updatedPrescription.duration = medications[0].duration;
        updatedPrescription.instructions = medications[0].instructions;
      }
      
      // Llamar al servicio para actualizar la prescripción
      const result = await prescriptionService.updatePrescription(prescription.id, updatedPrescription);
      
      // Si existe una función de callback para notificar actualización exitosa
      if (onUpdateSuccess) {
        onUpdateSuccess(result);
      } else if (onEdit) {
        // Mantener la compatibilidad con la implementación anterior
        onEdit(updatedPrescription);
      }
      
      setShowConfirmModal(false);
      setIsEditingAll(false);
      setChanges({});
      
      // Mostrar mensaje de éxito (puedes usar una librería de notificaciones como toastify)
      alert("Prescription updated successfully");
    } catch (err) {
      console.error("Error updating prescription:", err);
      setError("Failed to update prescription. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel all changes
  const handleCancelAllChanges = () => {
    setIsEditingAll(false);
    setShowConfirmModal(false);
    setChanges({});
    setShowNewMedForm(false);
  };

  // Render field (now only editable in "edit all" mode)
  const renderField = (fieldName, value, isTextarea = false) => {
    return (
      <div className="input-group mb-3">
        {isTextarea ? (
          <textarea
            className="form-control"
            rows="3"
            value={isEditingAll ? tempValues[fieldName] || '' : value || 'No data available'}
            onChange={isEditingAll ? (e) => handleInputChange(e, fieldName) : undefined}
            readOnly={!isEditingAll}
          ></textarea>
        ) : (
          <input 
            type="text" 
            className="form-control" 
            value={isEditingAll ? tempValues[fieldName] || '' : value || 'N/A'} 
            onChange={isEditingAll ? (e) => handleInputChange(e, fieldName) : undefined}
            readOnly={!isEditingAll}
          />
        )}
      </div>
    );
  };

  // Render medications table
  const renderMedicationsTable = () => {
    // If not editing and there's no medications array, show single medication
    if (!isEditingAll && !Array.isArray(prescription.medications)) {
      return (
        <table className="table table-striped text-center">
          <thead className="table-info">
            <tr>
              <th>Medicine ID</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{prescription.medicineId || 'N/A'}</td>
              <td>{prescription.dosage || 'N/A'}</td>
              <td>{prescription.frequency || 'N/A'}</td>
              <td>{prescription.duration || 'N/A'}</td>
              <td>{prescription.instructions || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      );
    }
    
    // For editing mode or when medications is an array
    const medsToShow = isEditingAll ? medications : 
                      (Array.isArray(prescription.medications) ? prescription.medications : []);
    
    return (
      <>
        <table className="table table-striped text-center">
          <thead className="table-info">
            <tr>
              <th>Medicine ID</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
              {isEditingAll && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {medsToShow.length > 0 ? (
              medsToShow.map((med, index) => (
                <tr key={index}>
                  <td>
                    {isEditingAll ? 
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={med.medicineId || ''} 
                        onChange={(e) => handleMedicationChange(e, index, 'medicineId')} 
                      /> : med.medicineId || 'N/A'}
                  </td>
                  <td>
                    {isEditingAll ? 
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={med.dosage || ''} 
                        onChange={(e) => handleMedicationChange(e, index, 'dosage')} 
                      /> : med.dosage || 'N/A'}
                  </td>
                  <td>
                    {isEditingAll ? 
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={med.frequency || ''} 
                        onChange={(e) => handleMedicationChange(e, index, 'frequency')} 
                      /> : med.frequency || 'N/A'}
                  </td>
                  <td>
                    {isEditingAll ? 
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={med.duration || ''} 
                        onChange={(e) => handleMedicationChange(e, index, 'duration')} 
                      /> : med.duration || 'N/A'}
                  </td>
                  <td>
                    {isEditingAll ? 
                      <input 
                        type="text" 
                        className="form-control form-control-sm" 
                        value={med.instructions || ''} 
                        onChange={(e) => handleMedicationChange(e, index, 'instructions')} 
                      /> : med.instructions || 'N/A'}
                  </td>
                  {isEditingAll && (
                    <td>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveMedication(index)}
                        disabled={medications.length === 1}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isEditingAll ? 6 : 5} className="text-center">No medications</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Add new medication form */}
        {isEditingAll && showNewMedForm && (
          <div className="card mb-3 mt-2">
            <div className="card-header bg-light">
              <h5>New Medication</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md">
                  <label className="form-label">Medicine ID <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newMedication.medicineId} 
                    onChange={(e) => handleNewMedicationChange(e, 'medicineId')}
                    required
                  />
                </div>
                <div className="col-md">
                  <label className="form-label">Dosage</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newMedication.dosage} 
                    onChange={(e) => handleNewMedicationChange(e, 'dosage')}
                  />
                </div>
                <div className="col-md">
                  <label className="form-label">Frequency</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newMedication.frequency} 
                    onChange={(e) => handleNewMedicationChange(e, 'frequency')}
                  />
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-md">
                  <label className="form-label">Duration</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newMedication.duration} 
                    onChange={(e) => handleNewMedicationChange(e, 'duration')}
                  />
                </div>
                <div className="col-md">
                  <label className="form-label">Instructions</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={newMedication.instructions} 
                    onChange={(e) => handleNewMedicationChange(e, 'instructions')}
                  />
                </div>
              </div>
              <div className="mt-3">
                <button 
                  className="btn btn-success me-2" 
                  onClick={handleAddMedication}
                >
                  <i className="bi bi-check-lg me-1"></i> Add
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowNewMedForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add medication button */}
        {isEditingAll && !showNewMedForm && (
          <button 
            className="btn btn-outline-primary btn-sm mt-2"
            onClick={() => setShowNewMedForm(true)}
          >
            <i className="bi bi-plus-circle me-1"></i> Add Medication
          </button>
        )}
      </>
    );
  };

  // Modal for confirmation
  const renderConfirmationModal = () => {
    if (!showConfirmModal) return null;
    
    return (
      <div className="modal show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Confirm Changes</h5>
              <button type="button" className="btn-close" onClick={() => setShowConfirmModal(false)}></button>
            </div>
            <div className="modal-body">
              <h4>Summary of Changes</h4>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead className="table-info">
                    <tr>
                      <th>Field</th>
                      <th>Original Value</th>
                      <th>New Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(changes).length > 0 ? (
                      Object.keys(changes).map(key => (
                        <tr key={key}>
                          <td>{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                          <td>{changes[key].oldValue}</td>
                          <td className="text-success">{changes[key].newValue}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center">No changes made</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Medications changes summary */}
              {(medications.length !== (Array.isArray(prescription.medications) ? 
                                        prescription.medications.length : 1)) && (
                <div className="mt-3">
                  <h5>Medication Changes</h5>
                  <div className="alert alert-info">
                    {Array.isArray(prescription.medications) ? 
                      `Changed from ${prescription.medications.length} to ${medications.length} medications` : 
                      `Changed from 1 to ${medications.length} medications`}
                  </div>
                </div>
              )}
              
              {/* Show error message if any */}
              {error && (
                <div className="alert alert-danger mt-3">
                  {error}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCancelAllChanges}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-success" 
                onClick={handleConfirmChanges}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>Confirm Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid p-0">
      {renderConfirmationModal()}
      
      <div className="row align-items-center mb-3">
        <div className="col">
          <h3>Prescription Details</h3>
        </div>
        <div className="col-auto">
          {!isEditingAll ? (
            <button 
              className="btn btn-primary me-2" 
              onClick={handleEditAll}
            >
              <i className="bi bi-pencil-fill me-1"></i> Edit Prescription
            </button>
          ) : (
            <button 
              className="btn btn-success me-2" 
              onClick={handleSaveAll}
            >
              <i className="bi bi-check-lg me-1"></i> Save All Changes
            </button>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Prescription ID</label>
          <input 
            type="text" 
            className="form-control" 
            value={prescription.id || 'N/A'} 
            readOnly 
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Date Prescribed</label>
          <input 
            type="text" 
            className="form-control" 
            value={isEditingAll ? tempValues.datePrescribed || '' : prescription.datePrescribed || 'N/A'} 
            readOnly={!isEditingAll}
            onChange={isEditingAll ? (e) => handleInputChange(e, 'datePrescribed') : undefined}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Doctor ID</label>
          {renderField('doctorId', prescription.doctorId)}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Doctor Name</label>
          {renderField('doctorName', prescription.doctorName)}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Patient ID</label>
          {renderField('patientId', prescription.patientId)}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Patient Name</label>
          {renderField('patientName', prescription.patientName)}
        </div>
      </div>

      <div className="mb-3">
        <h4>Clinical Information</h4>
        <div className="row">
          <div className="col-md-12 mb-3">
            <label className="form-label fw-bold">Symptoms</label>
            {renderField('symptoms', prescription.symptoms || 'No symptoms recorded', true)}
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 mb-3">
            <label className="form-label fw-bold">Diseases</label>
            {renderField('diseases', prescription.diseases || 'No diseases recorded', true)}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <h4>Medications</h4>
        <div className="table-responsive">
          {renderMedicationsTable()}
        </div>
      </div>

      <div className="mb-3">
        <h4>Tests</h4>
        {renderField('tests', prescription.tests || 'No tests prescribed', true)}
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Refills</label>
          {renderField('refills', prescription.refills || '0')}
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Consultation Type</label>
          {renderField('consultationType', prescription.consultationType || 'Regular')}
        </div>
      </div>
      
      {isEditingAll && (
        <div className="d-flex justify-content-end mt-4">
          <button 
            className="btn btn-secondary me-2"
            onClick={handleCancelAllChanges}
          >
            <i className="bi bi-x-lg me-1"></i> Cancel
          </button>
          <button 
            className="btn btn-success"
            onClick={handleSaveAll}
          >
            <i className="bi bi-check-lg me-1"></i> Save All Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewDetailPrescription;