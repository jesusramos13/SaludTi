import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import specialitiesData from '../../../data/specialities.json';
import genderData from '../../../data/genderOptions.json';
import languageData from '../../../data/languageOptions.json';
import * as url from '../../../helpers/urlHelper';

import { uploadSingleFile, uploadMultipleFiles } from '../../../helpers/uploadHelper';

const DoctorSave = ({ show, handleClose, isEdit, doctorData }) => {
    
  const [formData, setFormData] = useState({
    profilePicture: null,
    name: '',
    surname: '',
    phone: '',
    email: '',
    license: '',
    gender: '',
    experienceInYears: '',  // Changed from yearsOfExperience
    fees: '',
    languages: [],
    services: [], // Changed to array
    position: '',
    degree: '',
    role: 'doctor',
    image: null,
    certificates: [], // For UI display
    uploads: [] // For storing file IDs to send to API
  });

  useEffect(() => {
    if (isEdit && doctorData) {
      setFormData({
        ...formData,
        ...doctorData,
        profilePicture: null, // Reset file input as we can't set its value
        services: doctorData.services || [],
        certificates: [],
        uploads: doctorData.uploads || [], // Preserve existing file IDs
        experienceInYears: doctorData.experienceInYears || '' // Updated field name
      });
    } else {
      setFormData({
        profilePicture: null,
        image: null,
        name: '',
        surname: '',
        phone: '',
        email: '',
        license: '',
        gender: '',
        experienceInYears: '',  // Changed from yearsOfExperience
        fees: '',
        services: [],
        languages: [],
        position: '',
        degree: '',
        role: 'doctor',
        certificates: [], // to handel file input and display file details
        uploads: [] // to send file ids to API
      });
    }
  }, [doctorData, isEdit]);

  const handleTextInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePicture = async (e) => {
    const { files } = e.target;
    if (files[0]) {
      try {
        const fileData= await uploadSingleFile(files[0]);

        console.log('File uploaded successfully:', fileData);

        if(fileData && fileData._id) {
            setFormData(prev => ({ 
            ...prev, 
                profilePicture: files[0],
                image: fileData._id 
            }));
        }


      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  };

  const handleCertificatesChange = async (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      try {
        const uploadedFiles = await uploadMultipleFiles(files);
        console.log('Files uploaded successfully:', uploadedFiles);

        setFormData(prev => ({
          ...prev,
          certificates: [...Array.from(files)],
          uploads: [...prev.uploads, ...uploadedFiles.map(file => file._id)]
        }));
      } catch (error) {
        console.error('Error uploading certificates:', error);
      }
    }
  };

  const handleGenderSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      gender: option ? option.value : ''
    }));
  };

  const handleServicesSelect = (options) => {
    const values = options ? options.map(item => item.value) : [];
    setFormData(prev => ({
      ...prev,
      services: values
    }));
  };

  const handleLanguagesSelect = (options) => {
    const values = options ? options.map(item => item.value) : [];
    setFormData(prev => ({
        ...prev,
        languages: values
    }));
  };

  // Helper function to get current value for react-select
  const getCurrentValue = (field, options) => {
    if (field === 'gender') {
      return genderData.genderOptions.find(option => option.value === formData[field]) || null;
    }
    // For specialities and languages
    return formData[field].map(slug => 
      options.find(option => option.value === slug)
    ).filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiUrl = `${url.API_BASE_URL}${isEdit ? url.API_DOCTOR_UPDATE : url.API_DOCTOR_CREATE}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);
      handleClose();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className={`offcanvas offcanvas-end ${show ? 'show' : ''}`} tabIndex="-1" id="doctorSaveOffcanvas" 
    style={{ minWidth: '800px' }}>
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">
          {isEdit ? 'Edit Doctor' : 'Add New Doctor'}
        </h5>
        <button type="button" className="btn-close" onClick={handleClose}></button>
      </div>
      <div className="offcanvas-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Profile Picture</label>
            <input
              type="file"
              className="form-control"
              name="profilePicture"
              accept="image/*"
              onChange={handleProfilePicture}
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleTextInput}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Surname</label>
            <input
              type="text"
              className="form-control"
              name="surname"
              value={formData.surname}
              onChange={handleTextInput}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleTextInput}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email ID</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleTextInput}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">License Number</label>
            <input
              type="text"
              className="form-control"
              name="license"
              value={formData.license}
              onChange={handleTextInput}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Gender</label>
            <Select
              name="gender"
              options={genderData.genderOptions}
              value={getCurrentValue('gender', genderData.genderOptions)}
              onChange={handleGenderSelect}
              isClearable
              className="react-select"
              classNamePrefix="select"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Years of Experience</label>
            <input
              type="number"
              className="form-control"
              name="experienceInYears"
              value={formData.experienceInYears}
              onChange={handleTextInput}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Fees</label>
            <input
              type="number"
              className="form-control"
              name="fees"
              value={formData.fees}
              onChange={handleTextInput}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Position</label>
            <input
              type="text"
              className="form-control"
              name="position"
              value={formData.position}
              onChange={handleTextInput}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Degree</label>
            <input
              type="text"
              className="form-control"
              name="degree"
              value={formData.degree}
              onChange={handleTextInput}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Languages</label>
            <Select
              name="languages"
              options={languageData.languageOptions}
              value={languageData.languageOptions.filter(lang => 
                formData.languages.includes(lang.value)
              )}
              onChange={handleLanguagesSelect}
              isMulti
              className="react-select"
              classNamePrefix="select"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Specialities</label>
            <Select
              name="services"
              options={specialitiesData.specialities.map(spec => ({
                value: spec.slug,
                label: spec.value
              }))}
              value={specialitiesData.specialities
                .filter(spec => formData.services.includes(spec.slug))
                .map(spec => ({
                  value: spec.slug,
                  label: spec.value
                }))}
              onChange={handleServicesSelect}
              isMulti
              className="react-select"
              classNamePrefix="select"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Certificates</label>
            <input
              type="file"
              className="form-control"
              name="certificates"
              multiple
              onChange={handleCertificatesChange}
            />
            {formData.certificates.length > 0 && (
              <div className="mt-2">
                <p>Selected files:</p>
                <ul className="list-unstyled">
                  {formData.certificates.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
        </form>
      </div>
      <div className="offcanvas-footer p-3 border-top">
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            {isEdit ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSave;
