import React, { useState, useMemo, useEffect } from 'react';
import { MaterialReactTable } from 'material-react-table';
import PrescriptionFiltersHeader from '../Header/PrescriptionFiltersHeader';
import ActionTableButton from '../Buttons/ActionTableButton';

const PrescriptionTable = ({ prescriptions: propPrescriptions = [], onDeletePrescriptions }) => {
  
  // Base state
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  
  // Transform API data to the format expected by the table
  const transformApiData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) return [];
    
    // Log the original data for debug
    console.log('Prescripciones originales:', apiData.length);
    
    const transformedData = apiData.map(prescription => {
      // Check if prescription has medicines
      if (!prescription.prescribeMedicine || !Array.isArray(prescription.prescribeMedicine) || prescription.prescribeMedicine.length === 0) {
        console.warn('Prescription without medicines:', prescription._id);
        // Create at least one entry for prescriptions without medicines
        return [{
          id: prescription._id,
          doctorId: prescription.doctor?._id || '',
          doctorName: prescription.doctor?.name || '',
          patientId: prescription.patient?._id || '',
          patientName: prescription.patient?.name || '',
          medicineId: '',
          dosage: '',
          frequency: '',
          duration: '',
          refills: "0",
          instructions: '',
          datePrescribed: new Date().toISOString().split('T')[0],
          symptoms: prescription.symptoms || '',
          diseases: prescription.diseases?.map(d => d.name).join(", ") || '',
          diseasesIds: prescription.diseases?.map(d => d._id).join(", ") || '',
          tests: prescription.prescribeTests?.map(t => t.name).join(", ") || ''
        }];
      }
      
      // For each medicine in the prescription, create a separate entry
      return prescription.prescribeMedicine.map(medicine => ({
        id: prescription._id,
        doctorId: prescription.doctor?._id || '',
        doctorName: prescription.doctor?.name || '',
        patientId: prescription.patient?._id || '',
        patientName: prescription.patient?.name || '',
        medicineId: medicine.medicine || '',
        dosage: medicine.dose || '',
        frequency: medicine.frequency || '',
        duration: medicine.duration || '',
        refills: "0", // Default value since it doesn't exist in the API
        instructions: medicine.instruction || '',
        datePrescribed: new Date().toISOString().split('T')[0], // Current date as default value
        symptoms: prescription.symptoms || '',
        diseases: prescription.diseases?.map(d => d.name).join(", ") || '',
        diseasesIds: prescription.diseases?.map(d => d._id).join(", ") || '',
        tests: prescription.prescribeTests?.map(t => t.name).join(", ") || ''
      }));
    }).flat(); // Flatten the resulting array of arrays
    
    // Log the transformed data for debug
    console.log('Prescripciones transformadas:', transformedData.length);
    return transformedData;
  };
  
  // Effect to transform and load prescriptions from props
  useEffect(() => {
    if (propPrescriptions.length > 0) {
      // Transform API data
      const transformedData = transformApiData(propPrescriptions);
      setPrescriptions(transformedData);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setPrescriptions([]);
    }
  }, [propPrescriptions]);

  // Get selected prescriptions from rowSelection state
  const getSelectedPrescriptions = () => {
    const selectedRows = Object.keys(rowSelection).filter(key => rowSelection[key]);
    return prescriptions.filter((_, index) => selectedRows.includes(index.toString()));
  };

  // Function to filter prescriptions (for PrescriptionFiltersHeader)
  const handleFilterChange = (filters) => {
    // Store active filters for highlighting
    setActiveFilters(filters);
    
    // Get base data to filter
    const baseData = propPrescriptions.length > 0 ? 
      transformApiData(propPrescriptions) : [];
    
    const filtered = baseData.filter(prescription => {
      return (
        // Match original fields
        (!filters.id || (prescription.id && prescription.id.toString().toLowerCase().includes(filters.id.toLowerCase()))) &&
        (!filters.doctorId || (prescription.doctorId && prescription.doctorId.toString().toLowerCase().includes(filters.doctorId.toLowerCase()))) &&
        (!filters.patientId || (prescription.patientId && prescription.patientId.toString().toLowerCase().includes(filters.patientId.toLowerCase()))) &&
        (!filters.medicineId || (prescription.medicineId && prescription.medicineId.toString().toLowerCase().includes(filters.medicineId.toLowerCase()))) &&
        (!filters.dosage || (prescription.dosage && prescription.dosage.toString().toLowerCase().includes(filters.dosage.toLowerCase()))) &&
        (!filters.datePrescribed || (prescription.datePrescribed && prescription.datePrescribed.includes(filters.datePrescribed))) &&
        // New fields based on table data
        (!filters.doctorName || (prescription.doctorName && prescription.doctorName.toString().toLowerCase().includes(filters.doctorName.toLowerCase()))) &&
        (!filters.patientName || (prescription.patientName && prescription.patientName.toString().toLowerCase().includes(filters.patientName.toLowerCase()))) &&
        (!filters.frequency || (prescription.frequency && prescription.frequency.toString().toLowerCase().includes(filters.frequency.toLowerCase()))) &&
        (!filters.duration || (prescription.duration && prescription.duration.toString().toLowerCase().includes(filters.duration.toLowerCase()))) &&
        (!filters.symptoms || (prescription.symptoms && prescription.symptoms.toString().toLowerCase().includes(filters.symptoms.toLowerCase()))) &&
        (!filters.diseases || (prescription.diseases && prescription.diseases.toString().toLowerCase().includes(filters.diseases.toLowerCase()))) &&
        (!filters.diseasesIds || (prescription.diseasesIds && prescription.diseasesIds.toString().toLowerCase().includes(filters.diseasesIds.toLowerCase()))) &&
        (!filters.tests || (prescription.tests && prescription.tests.toString().toLowerCase().includes(filters.tests.toLowerCase()))) &&
        (!filters.instructions || (prescription.instructions && prescription.instructions.toString().toLowerCase().includes(filters.instructions.toLowerCase())))
      );
    });

    setPrescriptions(filtered);
    // Reset selection when filters change
    setRowSelection({});
  };

  // Universal search (for PrescriptionFiltersHeader)
  const handleUniversalSearch = (term) => {
    setSearchTerm(term);
    setGlobalFilter(term); // Use MaterialReactTable's globalFilter
    
    // Reset selection when search changes
    setRowSelection({});
  };

  // Function to update data after deletion
  const refreshData = (removedItem = null) => {
    if (removedItem) {
      const updatedPrescriptions = prescriptions.filter(p => p.id !== removedItem.id);
      setPrescriptions(updatedPrescriptions);
      
      // Notify parent component about deletion
      if (onDeletePrescriptions) {
        onDeletePrescriptions(removedItem);
      }
      
      // Reset selection after deletion
      setRowSelection({});
    }
  };

  // Handler for row click
  const handleRowClick = (row) => {
    console.log('Selected prescription:', row.original);
    // You can add additional logic for row selection here
  };

  // Highlight text based on search terms
  const highlightText = (text, filterTerm, fieldName) => {
    if (!text || typeof text !== 'string') return text;
    
    // Get the filter term for this specific field
    const termToHighlight = fieldName && activeFilters[fieldName] ? 
      activeFilters[fieldName].toLowerCase() : 
      searchTerm.toLowerCase();
    
    // If no search term or global filter, return original text
    if (!termToHighlight && !globalFilter) return text;
    
    // Use global filter if no specific filter term found
    const term = termToHighlight || globalFilter.toLowerCase();
    
    if (!term) return text;
    
    // Don't try to highlight if term isn't in text
    if (!text.toLowerCase().includes(term)) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === term.toLowerCase() ? 
            <span key={index} style={{ backgroundColor: '#FFFF00', fontWeight: 'bold' }}>{part}</span> : 
            part
        )}
      </>
    );
  };

  // Column definitions for MaterialReactTable with highlighted text
  const columns = useMemo(
    () => [
      {
        id: 'actions',
        header: 'Actions',
        size: 0,
        enableColumnOrdering: false,
        Cell: ({ row }) => (
          <ActionTableButton 
            item={row.original}
            refreshData={() => refreshData(row.original)}
          />          
        ),
      },
      {
        accessorKey: 'id',
        header: 'Prescription ID',
        size: 150,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.id, 'id'),
      },
      // {
      //   accessorKey: 'doctorName',
      //   header: 'Doctor',
      //   size: 150,
      //   Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.doctorName, 'doctorName'),
      // },
      {
        accessorKey: 'doctorId',
        header: 'Doctor ID',
        size: 150,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.doctorId, 'doctorId'),
      },
      // {
      //   accessorKey: 'patientName',
      //   header: 'Patient',
      //   size: 150,
      //   Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.patientName, 'patientName'),
      // },
      {
        accessorKey: 'patientId',
        header: 'Patient ID',
        size: 150,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.patientId, 'patientId'),
      },
      {
        accessorKey: 'symptoms',
        header: 'Symptoms',
        size: 200,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.symptoms, 'symptoms'),
      },
      // {
      //   accessorKey: 'diseases',
      //   header: 'Diseases',
      //   size: 200,
      //   Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.diseases, 'diseases'),
      // },
      // {
      //   accessorKey: 'diseasesIds',
      //   header: 'Disease IDs',
      //   size: 200,
      //   Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.diseasesIds, 'diseasesIds'),
      // },
      {
        accessorKey: 'medicineId',
        header: 'Medicine ID',
        size: 150,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.medicineId, 'medicineId'),
      },
      {
        accessorKey: 'dosage',
        header: 'Dosage',
        size: 120,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.dosage, 'dosage'),
      },
      {
        accessorKey: 'frequency',
        header: 'Frequency',
        size: 150,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.frequency, 'frequency'),
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        size: 120,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.duration, 'duration'),
      },
      {
        accessorKey: 'tests',
        header: 'Tests',
        size: 200,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.tests, 'tests'),
      },
      {
        accessorKey: 'instructions',
        header: 'Instructions',
        size: 250,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.instructions, 'instructions'),
      },
      {
        accessorKey: 'datePrescribed',
        header: 'Date',
        size: 150,
        Cell: ({ cell }) => highlightText(cell.getValue(), activeFilters.datePrescribed, 'datePrescribed'),
      },
    ],
    [activeFilters, searchTerm, globalFilter],
  );

  return (
    <div className="container-fluid">
      <PrescriptionFiltersHeader 
        onFilterChange={handleFilterChange} 
        onSearchChange={handleUniversalSearch}
        selectedPrescriptions={getSelectedPrescriptions()}
        onClearSelection={() => setRowSelection({})}
        onBulkDelete={(prescriptionsToDelete) => {
          const remainingPrescriptions = prescriptions.filter(
            prescription => !prescriptionsToDelete.some(p => p.id === prescription.id)
          );
          
          setPrescriptions(remainingPrescriptions);
          
          // Notify parent component about bulk deletions - pass the entire array
          if (onDeletePrescriptions && prescriptionsToDelete.length > 0) {
            onDeletePrescriptions(prescriptionsToDelete); // Pass the entire array
          }
          
          setRowSelection({});
        }}
      />

      <MaterialReactTable
        columns={columns}
        data={prescriptions}
        state={{ 
          isLoading,
          rowSelection,
          globalFilter
        }}
        enableRowSelection
        onRowSelectionChange={setRowSelection}
        enableColumnFilters
        enableColumnOrdering
        enableSorting
        enablePagination
        enableGlobalFilter
        onGlobalFilterChange={setGlobalFilter}
        muiTableBodyRowProps={({ row }) => ({
          onClick: () => handleRowClick(row),
          sx: { cursor: 'pointer' },
        })}
        initialState={{
          density: 'compact',
          pagination: { pageIndex: 0, pageSize: 10 }
        }}
      />
    </div>
  );
};

export default PrescriptionTable;