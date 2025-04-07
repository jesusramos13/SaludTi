import React, { useState } from "react";
import { FaDownload, FaFileCsv, FaFilePdf, FaFileExcel, FaArchive, FaTrash } from "react-icons/fa";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import prescriptionService from '../services/prescriptionService';

const ActionButton = ({ selectedPrescriptions = [], onBulkDelete, refreshData, apiBaseUrl = '/api' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleActionClick = (action) => {
    setShowDropdown(false);
    
    // Only execute actions if there are selected prescriptions
    if (selectedPrescriptions.length > 0) {
      console.log(`${action} clicked for ${selectedPrescriptions.length} prescriptions`);
      
      switch(action) {
        case "Print":
          printPrescriptions(selectedPrescriptions);
          break;
        case "Export CSV":
          exportToCSV(selectedPrescriptions);
          break;
        case "Export PDF":
          exportToPDF(selectedPrescriptions);
          break;
        case "Export Excel":
          exportToExcel(selectedPrescriptions);
          break;
        case "Archive":
          archivePrescriptions(selectedPrescriptions);
          break;
        case "Delete":
          deletePrescriptions(selectedPrescriptions);
          break;
        default:
          console.warn(`Acción desconocida: ${action}`);
          break;
      }
    }
  };

  const printPrescriptions = (prescriptions) => {
    if (prescriptions.length === 0) return;

    // Create a new window for printing
    const printWindow = window.open('', 'PRINT', 'height=800,width=1200');
    
    // Create HTML content
    const tableHTML = `
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
            h1 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>Prescription Details</h1>
          <table>
            <thead>
              <tr>
                ${Object.keys(prescriptions[0]).map(key => 
                  `<th>${key.charAt(0).toUpperCase() + key.slice(1)}</th>`
                ).join('')}
              </tr>
            </thead>
            <tbody>
              ${prescriptions.map(prescription => 
                `<tr>
                  ${Object.values(prescription).map(value => 
                    `<td>${value}</td>`
                  ).join('')}
                </tr>`
              ).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Write the HTML to the new window
    printWindow.document.write(tableHTML);
    
    // Close the document for writing
    printWindow.document.close();
    
    // Trigger the print dialog
    printWindow.focus();
    printWindow.print();
  };

  const exportToCSV = (prescriptions) => {
    if (prescriptions.length === 0) return;

    const headers = Object.keys(prescriptions[0]).join(',');
    const rows = prescriptions.map(p => 
      Object.values(p).map(value => 
        `"${value}"` // Wrap values in quotes to handle potential commas
      ).join(',')
    ).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "prescriptions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (prescriptions) => {
    if (prescriptions.length === 0) return;

    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Set the document title
    doc.text("Prescription Details", 14, 16);

    // Prepare table data
    const tableColumn = Object.keys(prescriptions[0]);
    const tableRows = prescriptions.map(prescription => 
      tableColumn.map(key => prescription[key])
    );

    // Use autoTable method from jspdf-autotable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 24,
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      columnStyles: { 
        0: { cellWidth: 'auto' } 
      }
    });

    // Save the PDF
    doc.save("prescriptions.pdf");
  };

  const exportToExcel = (prescriptions) => {
    if (prescriptions.length === 0) return;

    // Create a new workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(prescriptions);
    const workbook = XLSX.utils.book_new();
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prescriptions");
    
    // Generate and save the Excel file
    XLSX.writeFile(workbook, "prescriptions.xlsx");
  };

  const archivePrescriptions = (prescriptions) => {
    alert(`Archiving ${prescriptions.length} prescriptions`);
  };

  // Updated function for prescription deletion with improved page refresh
  const deletePrescriptions = async (prescriptions) => {
    // Get the prescription IDs to display in the confirmation message
    // Handle both id and _id formats
    const idList = prescriptions.map(prescription => prescription._id || prescription.id).join(", ");
    
    if (window.confirm(`Are you sure you want to delete the prescriptions with IDs: ${idList}?`)) {
      setIsDeleting(true);
      
      // Counter to track completed deletions
      let successfulDeletions = 0;
      const deletionErrors = [];
      
      // Array to track all deletion promises
      const deletionPromises = prescriptions.map(prescription => {
        // Use either _id or id depending on which one exists
        const prescriptionId = prescription._id || prescription.id;
        console.log('Deleting prescription with ID:', prescriptionId);
        
        // Use the prescriptionService to delete
        return prescriptionService.deletePrescription(prescriptionId)
          .then(response => {
            successfulDeletions++;
            console.log(`Successfully deleted prescription ${prescriptionId}`);
            return { success: true, id: prescriptionId };
          })
          .catch(error => {
            console.error(`Error deleting prescription ${prescriptionId}:`, error);
            deletionErrors.push(`ID ${prescriptionId}: ${error.message || 'Unknown error'}`);
            return { success: false, id: prescriptionId, error };
          });
      });
      
      try {
        const results = await Promise.all(deletionPromises);
        
        // Show final message
        if (successfulDeletions === prescriptions.length) {
          console.log(`Successfully deleted all ${prescriptions.length} prescriptions`);
        } else {
          const errorMessage = `Deleted ${successfulDeletions} out of ${prescriptions.length} prescriptions. Errors: ${deletionErrors.join('; ')}`;
          console.warn(errorMessage);
          alert(errorMessage);
        }
        
        // Call the callback if provided with successfully deleted prescriptions
        if (onBulkDelete) {
          const successfullyDeletedPrescriptions = prescriptions.filter((prescription, index) => 
            results[index].success
          );
          onBulkDelete(successfullyDeletedPrescriptions);
        }
        
        // Always refresh data after deletion operations, regardless of partial success
        console.log('Refreshing data and KPIs after deletion');
        if (refreshData) {
          refreshData();
        } else {
          // If no refreshData function is provided, refresh the page to update KPIs
          window.location.reload();
        }
      } catch (error) {
        console.error('Error in bulk deletion:', error);
        alert(`An unexpected error occurred during deletion: ${error.message}`);
        
        // Even in case of errors, try to refresh data to maintain consistency
        if (refreshData) {
          refreshData();
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="dropdown">
      <button 
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : `Actions ${selectedPrescriptions.length > 0 ? `(${selectedPrescriptions.length})` : ''}`}
      </button>
      {showDropdown && (
        <div className="dropdown-menu show" style={{display: 'block'}}>
          <h6 className="dropdown-header">Bulk Actions</h6>
          
          <button 
            className="dropdown-item" 
            onClick={() => handleActionClick("Print")}
            disabled={selectedPrescriptions.length === 0 || isDeleting}
          >
            <FaDownload className="me-2" /> Print Prescriptions
          </button>
          
          <div className="dropdown-divider"></div>
          
          <h6 className="dropdown-header">Export Options</h6>
          <button 
            className="dropdown-item" 
            onClick={() => handleActionClick("Export CSV")}
            disabled={selectedPrescriptions.length === 0 || isDeleting}
          >
            <FaFileCsv className="me-2" /> Export CSV
          </button>
          <button 
            className="dropdown-item" 
            onClick={() => handleActionClick("Export PDF")}
            disabled={selectedPrescriptions.length === 0 || isDeleting}
          >
            <FaFilePdf className="me-2" /> Export PDF
          </button>
          <button 
            className="dropdown-item" 
            onClick={() => handleActionClick("Export Excel")}
            disabled={selectedPrescriptions.length === 0 || isDeleting}
          >
            <FaFileExcel className="me-2" /> Export Excel
          </button>
          
          <div className="dropdown-divider"></div>
          
          <button 
            className="dropdown-item" 
            onClick={() => handleActionClick("Archive")}
            disabled={selectedPrescriptions.length === 0 || isDeleting}
          >
            <FaArchive className="me-2" /> Archive Selected
          </button>
          
          <button 
            className="dropdown-item text-danger" 
            onClick={() => handleActionClick("Delete")}
            disabled={selectedPrescriptions.length === 0 || isDeleting}
          >
            <FaTrash className="me-2" /> {isDeleting ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionButton;