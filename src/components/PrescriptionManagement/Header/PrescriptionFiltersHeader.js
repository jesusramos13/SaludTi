import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import { BsSearch } from "react-icons/bs";
import CreatePrescriptionModal from '../Popup/CreatePrescriptionModal';
import PrescriptionFilter from '../Buttons/PrescriptionFilter';
import ActionButton from '../Buttons/PrescriptionActionButton';
import UniversalSearch from '../Buttons/UniversalSearch';

const PrescriptionFiltersHeader = ({ 
  onFilterChange,
  onSearchChange,
  selectedPrescriptions = [],
  onClearSelection,
  onBulkDelete = () => {} 
}) => {
  const [currentFilters, setCurrentFilters] = useState({
    id: '',
    doctorId: '',
    doctorName: '',
    patientId: '',
    patientName: '',
    medicineId: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    datePrescribed: '',
    symptoms: '',
    diseases: '',
    tests: '',
    searchName: '',
    status: ''
  });
  const [activeFilters, setActiveFilters] = useState([]);
  const [showActiveFilters, setShowActiveFilters] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const convertFiltersToArray = (filters) => {
    return Object.entries(filters)
      .filter(([, value]) => value !== '')
      .map(([label, value]) => ({ 
        label: label.charAt(0).toUpperCase() + label.slice(1), 
        value, 
        key: label 
      }));
  };

  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
    
    const newActiveFilters = convertFiltersToArray(filters);
    setActiveFilters(newActiveFilters);
    
    onFilterChange(filters);
  };

  const handleUniversalSearch = (searchTerm) => {
    const updatedFilters = { 
      ...currentFilters, 
      searchName: searchTerm 
    };
    
    setCurrentFilters(updatedFilters);
    
    const newActiveFilters = convertFiltersToArray(updatedFilters);
    setActiveFilters(newActiveFilters);

    onSearchChange(searchTerm);
  };

  const removeFilter = (filterToRemove) => {
    const updatedFilters = { ...currentFilters };
    
    updatedFilters[filterToRemove.key] = '';
    
    setCurrentFilters(updatedFilters);
    
    const newActiveFilters = convertFiltersToArray(updatedFilters);
    setActiveFilters(newActiveFilters);
    
    onFilterChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const resetFilters = {
      id: '',
      doctorId: '',
      doctorName: '',
      patientId: '',
      patientName: '',
      medicineId: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      datePrescribed: '',
      symptoms: '',
      diseases: '',
      tests: '',
      searchName: '',
      status: ''
    };

    setCurrentFilters(resetFilters);
    setActiveFilters([]);
    onFilterChange(resetFilters);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSavePrescription = (prescriptionData) => {
    console.log('Prescription Data:', prescriptionData);
  };

  const toggleActiveFiltersVisibility = () => {
    setShowActiveFilters(!showActiveFilters);
  };

  const toggleFilterSidebar = () => {
    setShowFilterSidebar(!showFilterSidebar);
  };

  // Include selected prescriptions in active filters
  const allActiveFilters = [
    ...activeFilters,
    ...(selectedPrescriptions.length > 0 
      ? [{ 
          label: 'Presc. Selected', 
          value: selectedPrescriptions.length, 
          key: 'selectedPrescriptions' 
        }] 
      : [])
  ];

  return (
    <>     
      <div className="container-fluid">
        <div className="row mt-3 align-items-center">
          <div className="col-md-auto">
            <UniversalSearch 
              onSearch={handleUniversalSearch}
              placeholder="Search prescriptions..."
            />
          </div>

          <div className="col-auto ms-auto">
            <div className="btn-group me-2">
              <ActionButton 
                selectedPrescriptions={selectedPrescriptions}
                onBulkDelete={onBulkDelete}
              />
            </div>

            <div className="btn-group me-2">
              <button 
                className="btn btn-outline-secondary me-2"
                type="button"
                onClick={toggleFilterSidebar}
              >
                <BsSearch className="me-1" /> Filter
              </button>
              
              <div className="position-relative">
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={toggleActiveFiltersVisibility}
                >
                  <FaBars /> 
                  {allActiveFilters.length > 0 && (
                    <span 
                      className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-primary" 
                      style={{fontSize: '0.6rem', padding: '0.2rem 0.4rem'}}
                    >
                      {allActiveFilters.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <CreatePrescriptionModal 
              show={showModal}
              handleClose={handleCloseModal}
              onSave={handleSavePrescription}
            />
          </div>
        </div>
      </div>

      {showFilterSidebar && (
        <div 
          className="position-fixed top-0 end-0 h-100 bg-white shadow" 
          style={{width: '350px', zIndex: 1050, overflowY: 'auto'}}
        >
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Filters of Prescriptions</h5>
              <button 
                className="btn btn-close" 
                onClick={toggleFilterSidebar}
              ></button>
            </div>
            <PrescriptionFilter 
              initialFilters={currentFilters}
              onFilterChange={handleFilterChange} 
            />
          </div>
        </div>
      )}
      {showActiveFilters && allActiveFilters.length > 0 && (
        <div className="container-fluid mb-3 mt-3 border ">
          <div className="row align-items-center">
            <div className="col-auto">
              <span className="text-muted me-2">Active Filters:</span>
              {allActiveFilters.map((filter, index) => (
                <span 
                  key={index} 
                  className="badge bg-light text-dark me-2 d-inline-flex align-items-center"
                >
                  {filter.label}: {filter.value}
                  <button 
                    className="btn btn-sm btn-link p-0 ms-2"
                    onClick={() => {
                      if (filter.key === 'selectedPrescriptions') {
                        onClearSelection && onClearSelection();
                      } else {
                        removeFilter(filter);
                      }
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <div className="col-auto ms-auto ">
              {allActiveFilters.length > 0 && (
                <button 
                  className="btn btn-link text-primary"
                  onClick={clearAllFilters}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrescriptionFiltersHeader;