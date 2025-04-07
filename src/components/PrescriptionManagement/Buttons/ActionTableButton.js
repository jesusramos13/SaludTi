import React, { useEffect, useRef, useState } from 'react';
import { FiMoreVertical, FiEye, FiEdit, FiPrinter, FiArchive, FiTrash2 } from "react-icons/fi";
import ReactDOM from 'react-dom';
import ViewDetailPrescription from '../Popup/ViewDetailPrescription';

const ActionTableButton = ({ 
  item, 
  refreshData,
  viewModalTarget = "viewPrescriptionDetailModal" 
}) => {
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  
  // Estados
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Calcular posición del dropdown
  const calculatePosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    return {
      top: buttonRect.bottom + scrollTop,
      left: buttonRect.right - 150 + scrollLeft, // 150px es el ancho aproximado del dropdown
    };
  };
  
  // Manejar clic en el botón de acción
  const toggleDropdown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Calcular y establecer posición antes de mostrar
    const position = calculatePosition();
    setDropdownPosition(position);
    setDropdownVisible(!dropdownVisible);
  };
  
  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownVisible && 
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current && 
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownVisible]);
  
  // Efecto para manejar el bloqueo del scroll cuando el modal está abierto
  useEffect(() => {
    if (showModal) {
      // Prevenir scroll en el body
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Compensar el scrollbar
    } else {
      // Restaurar scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      // Limpiar al desmontar
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showModal]);
  
  // Funciones de acción
  const handleViewDetails = (e) => {
    e.stopPropagation();
    console.log("View details for prescription:", item.id);
    setSelectedPrescription(item);
    setIsEditMode(false);
    setShowModal(true);
    setDropdownVisible(false);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedPrescription(null);
    setIsEditMode(false);
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    console.log('Edit prescription with ID:', item.id);
    // Preparamos el objeto de prescripción con una señal para indicar modo edición
    const prescriptionWithEditMode = { ...item, initialEditMode: true };
    setSelectedPrescription(prescriptionWithEditMode);
    setIsEditMode(true);
    setShowModal(true);
    setDropdownVisible(false);
  };
  
  const handlePrint = (e) => {
    e.stopPropagation();
    console.log('Print prescription with ID:', item.id);
    
    // Crear una nueva ventana para la impresión
    const printWindow = window.open('', '', 'width=800,height=600');
    
    // Crear contenido HTML para la impresión
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription Details</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
            }
            .print-header { 
              text-align: center; 
              margin-bottom: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Prescription Details</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>Prescription Id</th>
                <th>Doctor Id</th>
                <th>Patient Id</th>
                <th>Medicine Id</th>
                <th>Dosage</th>
                <th>Date Prescribed</th>
                <th>Refills</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${item.id}</td>
                <td>${item.doctorId}</td>
                <td>${item.patientId}</td>
                <td>${item.medicineId}</td>
                <td>${item.dosage}</td>
                <td>${item.datePrescribed}</td>
                <td>${item.refills}</td>
                <td>${item.instructions}</td>
              </tr>
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setDropdownVisible(false);
  };
  
  const handleArchive = (e) => {
    e.stopPropagation();
    console.log('Archive prescription with ID:', item.id);
    setDropdownVisible(false);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the prescription with ID: ${item.id}?`)) {
      console.log('Delete prescription with ID:', item.id);
      
      // Si hay una función para refrescar datos, la llamamos
      if (refreshData) refreshData();
    }
    
    setDropdownVisible(false);
  };
  
  const handleSave = (updatedPrescription) => {
    console.log('Saving updated prescription:', updatedPrescription);
    // Aquí implementaría la lógica para guardar los cambios
    // Por ejemplo, llamar a una API o actualizar el estado global
    
    // Después de guardar, podría cerrar el modal o volver al modo de visualización
    if (refreshData) refreshData();
    closeModal();
  };
  
  // Componente Dropdown que se renderizará en el portal
  const DropdownMenu = () => {
    if (!dropdownVisible) return null;
    
    return ReactDOM.createPortal(
      <div 
        ref={dropdownRef}
        className="dropdown-menu show"
        style={{
          position: 'absolute',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          zIndex: 9999,
          minWidth: '150px',
          backgroundColor: '#fff',
          boxShadow: '0 2px 10px rgba(0,0,0,.2)',
          border: '1px solid rgba(0,0,0,.15)',
          borderRadius: '4px',
          padding: '0.5rem 0'
        }}
      >
        <button 
          className="dropdown-item d-flex align-items-center" 
          type="button"
          onClick={handleViewDetails}
        >
          <FiEye className="me-2" /> View Details
        </button>
        <button 
          className="dropdown-item d-flex align-items-center" 
          type="button"
          onClick={handleEdit}
        >
          <FiEdit className="me-2" /> Edit
        </button>
        <button 
          className="dropdown-item d-flex align-items-center" 
          type="button"
          onClick={handlePrint}
        >
          <FiPrinter className="me-2" /> Print
        </button>
        <button 
          className="dropdown-item d-flex align-items-center" 
          type="button"
          onClick={handleArchive}
        >
          <FiArchive className="me-2" /> Archive
        </button>
        <button 
          className="dropdown-item d-flex align-items-center text-danger" 
          type="button"
          onClick={handleDelete}
        >
          <FiTrash2 className="me-2" /> Delete
        </button>
      </div>,
      document.body
    );
  };
  
  // Componente Modal para ver detalles
  const DetailModal = () => {
    if (!showModal) return null;
    
    // Usando portal para renderizar el modal fuera del flujo normal del DOM
    return ReactDOM.createPortal(
      <div className="modal-backdrop-custom">
        <div 
          ref={modalRef}
          className="modal-custom" 
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div 
            className="modal-dialog modal-lg" 
            style={{
              maxWidth: '800px',
              width: '100%',
              margin: '10px',
              backgroundColor: '#fff',
              borderRadius: '5px',
              boxShadow: '0 5px 15px rgba(0,0,0,.5)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '90vh',
              overflow: 'hidden'
            }}>
              <div className="modal-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderBottom: '1px solid #dee2e6'
              }}>
                <h5 className="modal-title">
                  {isEditMode ? 'Edit Prescription' : 'Prescription Details'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body" style={{
                padding: '1rem',
                overflow: 'auto'
              }}>
                {selectedPrescription && ( 
                  <ViewDetailPrescription 
                    prescription={selectedPrescription} 
                    onEdit={handleSave}
                  />
                )}
              </div>
              <div className="modal-footer" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '1rem',
                borderTop: '1px solid #dee2e6'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };
  
  return (
    <>
      <div onClick={e => e.stopPropagation()}>
        <button 
          ref={buttonRef}
          className="btn btn-sm" 
          type="button" 
          onClick={toggleDropdown}
          aria-expanded={dropdownVisible}
        >
          <FiMoreVertical />
        </button>
      </div>
      
      {/* Renderizar el menú dropdown a través del portal */}
      <DropdownMenu />
      
      {/* Renderizar el modal a través del portal */}
      <DetailModal />
    </>
  );
};

export default ActionTableButton;