import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { MaterialReactTable } from 'material-react-table';
import DoctorHeader from '../Header/DoctorHeader';
import DoctorSave from '../Popup/DoctorSave';
import { API_BASE_URL, API_DOCTOR_LIST } from '../../../helpers/urlHelper';
import specialitiesData from '../../../data/specialities.json';

const DoctorList = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the list of doctors when the component mounts
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Function to fetch the list of doctors from the API
  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_DOCTOR_LIST}`);
      if (response.data.status) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get the names of specialities based on the service slugs
  const getSpecialityNames = (services) => {
    return services.map(service => {
      const specialty = specialitiesData.specialities.find(s => s.slug === service);
      return specialty ? specialty.value : service;
    }).join(', ');
  };


  // Define columns for the MaterialReactTable
  // You can customize the columns as per your requirements
  const columns = useMemo(
    () => [
      {
        accessorKey: 'customid',
        header: 'ID',
      },
      {
        accessorKey: 'name',
        header: 'Name',
        Cell: ({ row }) => `${row.original.name} ${row.original.surname}`,
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        Cell: ({ row }) => row.original.gender ? row.original.gender.charAt(0).toUpperCase() + row.original.gender.slice(1) : 'N/A',
      },
      {
        accessorKey: 'services',
        header: 'Specialities',
        Cell: ({ row }) => getSpecialityNames(row.original.services),
      },
      {
        accessorKey: 'experienceInYears',
        header: 'Experience (Years)',
        Cell: ({ row }) => row.original.experienceInYears || 'N/A',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'phone',
        header: 'Contact',
      },
      {
        accessorKey: 'languages',
        header: 'Languages',
        Cell: ({ row }) => row.original.languages.join(', '),
      },
    ],
    []
  );

  const handleAddNew = () => {
    setSelectedDoctor(null);
    setIsEdit(false);
    setShowOffcanvas(true);
  };

  const handleRowClick = (row) => {
    setSelectedDoctor(row.original);
    setIsEdit(true);
    setShowOffcanvas(true);
  };

  const handleCloseOffcanvas = () => {
    setShowOffcanvas(false);
    setSelectedDoctor(null);
    setIsEdit(false);
    fetchDoctors(); // Refresh the table data
  };

  return (
    <>
      <DoctorHeader onAddNew={handleAddNew} />
      <MaterialReactTable
        columns={columns}
        data={doctors}
        state={{ isLoading }}
        enableRowSelection={false}
        enableColumnFilters
        enableColumnOrdering
        enableSorting
        enablePagination
        muiTableBodyRowProps={({ row }) => ({
          onClick: () => handleRowClick(row),
          sx: { cursor: 'pointer' },
        })}
      />

      <DoctorSave 
        show={showOffcanvas}
        handleClose={handleCloseOffcanvas}
        isEdit={isEdit}
        doctorData={selectedDoctor}
      />
    </>
  );
};

export default DoctorList;
