import React, { useState, useEffect } from 'react';

const PrescriptionFilter = ({ initialFilters = {}, onFilterChange }) => {
    // Updated state to match the fields in PrescriptionTable
    const [filters, setFilters] = useState({
        id: initialFilters.id || '',
        doctorId: initialFilters.doctorId || '',
        patientId: initialFilters.patientId || '',
        medicineId: initialFilters.medicineId || '',
        dosage: initialFilters.dosage || '',
        frequency: initialFilters.frequency || '',
        duration: initialFilters.duration || '',
        instructions: initialFilters.instructions || '',
        datePrescribed: initialFilters.datePrescribed || '',
        symptoms: initialFilters.symptoms || '',
        tests: initialFilters.tests || '',
        status: initialFilters.status || ''
    });

    useEffect(() => {
        setFilters({
            id: initialFilters.id || '',
            doctorId: initialFilters.doctorId || '',
            patientId: initialFilters.patientId || '',
            medicineId: initialFilters.medicineId || '',
            dosage: initialFilters.dosage || '',
            frequency: initialFilters.frequency || '',
            duration: initialFilters.duration || '',
            instructions: initialFilters.instructions || '',
            datePrescribed: initialFilters.datePrescribed || '',
            symptoms: initialFilters.symptoms || '',
            tests: initialFilters.tests || '',
            status: initialFilters.status || ''
        });
    }, [initialFilters]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const resetFilters = () => {
        const resetState = {
            id: '',
            doctorId: '',
            patientId: '',
            medicineId: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
            datePrescribed: '',
            symptoms: '',
            tests: '',
            status: ''
        };

        setFilters(resetState);
        onFilterChange(resetState);
    };

    return (
        <div className="card">
            <div className="card-header">
                <h6 className="mb-0">Prescription Filters</h6>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Prescription ID</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="id"
                            value={filters.id}
                            onChange={handleInputChange}
                            placeholder="Filter by Prescription ID"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Doctor ID</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="doctorId"
                            value={filters.doctorId}
                            onChange={handleInputChange}
                            placeholder="Filter by Doctor ID"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Patient ID</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="patientId"
                            value={filters.patientId}
                            onChange={handleInputChange}
                            placeholder="Filter by Patient ID"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Medicine ID</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="medicineId"
                            value={filters.medicineId}
                            onChange={handleInputChange}
                            placeholder="Filter by Medicine ID"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Symptoms</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="symptoms"
                            value={filters.symptoms}
                            onChange={handleInputChange}
                            placeholder="Filter by Symptoms"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Dosage</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="dosage"
                            value={filters.dosage}
                            onChange={handleInputChange}
                            placeholder="Filter by Dosage"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Frequency</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="frequency"
                            value={filters.frequency}
                            onChange={handleInputChange}
                            placeholder="Filter by Frequency"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Duration</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="duration"
                            value={filters.duration}
                            onChange={handleInputChange}
                            placeholder="Filter by Duration"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Tests</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="tests"
                            value={filters.tests}
                            onChange={handleInputChange}
                            placeholder="Filter by Tests"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Instructions</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="instructions"
                            value={filters.instructions}
                            onChange={handleInputChange}
                            placeholder="Filter by Instructions"
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Date Prescribed</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            name="datePrescribed"
                            value={filters.datePrescribed}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Status</label>
                        <select 
                            className="form-control" 
                            name="status"
                            value={filters.status}
                            onChange={handleInputChange}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="d-flex justify-content-between">
                    <button 
                        className="btn btn-primary" 
                        onClick={resetFilters}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionFilter;