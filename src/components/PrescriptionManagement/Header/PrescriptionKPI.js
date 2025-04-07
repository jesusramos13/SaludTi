import React, { useState, useEffect } from 'react';
import { BsCaretDownFill, BsCaretRightFill, BsPrescription, BsFileEarmarkMedical, BsPerson, BsPeople, BsCapsule, BsActivity } from "react-icons/bs";

const PrescriptionKPI = ({ prescriptions }) => {
  const [kpis, setKpis] = useState([]);
  const [showKPI, setShowKPI] = useState(true);

  useEffect(() => {
    // Calculate KPIs using the provided prescriptions data
    const calculateKpis = () => {
      if (!prescriptions || prescriptions.length === 0) {
        return;
      }
      
      // Calcular recuentos únicos
      const uniqueDoctors = new Set(prescriptions.map(p => p.doctor._id)).size;
      const totalPrescriptions = prescriptions.length;
      const uniquePatients = new Set(prescriptions.map(p => p.patient._id)).size;
      
      // Count unique medicines across all prescriptions
      const medicineIds = new Set();
      prescriptions.forEach(prescription => {
        prescription.prescribeMedicine.forEach(med => {
          medicineIds.add(med.medicine);
        });
      });
      const uniqueMedicines = medicineIds.size;
      
      // Count total prescribeTests
      const totalTests = prescriptions.reduce((acc, curr) => acc + curr.prescribeTests.length, 0);
      
      // Count total prescribeMedicines
      const totalMedicines = prescriptions.reduce((acc, curr) => acc + curr.prescribeMedicine.length, 0);
      
      // Calculate avg medicines per prescription
      const avgMedicines = totalPrescriptions > 0 ? (totalMedicines / totalPrescriptions).toFixed(1) : '0.0';

      setKpis([        
        { 
          title: 'Total Prescriptions', 
          value: totalPrescriptions, 
          icon: <BsPrescription />, 
          bgColor: '#e7f0ff', 
          iconColor: '#e9ffea' 
        },
        { 
          title: 'Total Doctors', 
          value: uniqueDoctors, 
          icon: <BsPerson />, 
          bgColor: '#e7f0ff', 
          iconColor: '#d7e7fd' 
        },
        { 
          title: 'Total Patients', 
          value: uniquePatients, 
          icon: <BsPeople />, 
          bgColor: '#e7f0ff', 
          iconColor: '#fde6f7' 
        },
        { 
          title: 'Unique Medicines', 
          value: uniqueMedicines, 
          icon: <BsCapsule />, 
          bgColor: '#e7f0ff', 
          iconColor: '#faffe0' 
        },
        { 
          title: 'Avg Medicines', 
          value: avgMedicines, 
          icon: <BsActivity />, 
          bgColor: '#e7f0ff', 
          iconColor: '#faffe0' 
        },
        { 
          title: 'Total Tests', 
          value: totalTests, 
          icon: <BsFileEarmarkMedical />, 
          bgColor: '#e7f0ff', 
          iconColor: '#e9ffea' 
        },
      ]);
    };
    
    // Call the KPI calculation method
    calculateKpis();
  }, [prescriptions]); // Recalculate whenever prescriptions data changes

  const toggleKPI = () => {
    setShowKPI(!showKPI);
  };

  return (
    <>
      <section className="d-flex align-items-center">
        <div className="breadcrumb fs-6 mt-3">
          <span>Dashboard / Campaign</span>
        </div>
        <button onClick={toggleKPI} className="btn text-primary fs-6">
          {showKPI ? 'Hide KPI' : 'Show KPI '} {showKPI ? <BsCaretDownFill /> : <BsCaretRightFill />}
        </button>                    
      </section>
      
      {showKPI && (
        <div className='container-fluid mt-3'>
          <div className="row g-3">
            {kpis.map((kpi, index) => (
              <div key={index} className='col-md-2 col-sm-4 col-6'>
                <div className="card p-2 d-flex align-items-center shadow-sm" style={{ borderRadius: '10px', height: '100%' }}>
                  <div className='d-flex align-items-center'>
                    <div 
                      className='icon p-2 d-flex align-items-center justify-content-center' 
                      style={{ 
                        fontSize: '24px', 
                        backgroundColor: kpi.iconColor, 
                        marginRight: '10px', 
                        borderRadius: '50%', 
                        width: '45px',
                        height: '45px',
                        color: '#555' 
                      }}
                    >
                      {kpi.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '12px'}}>{kpi.title}</div>
                      <div style={{ fontSize: '16px'}}><strong>{kpi.value}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PrescriptionKPI;