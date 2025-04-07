import React, { useState, useEffect } from 'react';
import PrescriptionKPI from '../Header/PrescriptionKPI';
import PrescriptionTable from '../Body/Prescriptiontable';
import NavigationMenu from '../Header/NavigationMenu';
import prescriptionService from '../services/prescriptionService'; 

const PrescriptionList = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleDeletePrescriptions = async (prescriptionsToDelete) => {
        try {
            if (Array.isArray(prescriptionsToDelete)) {
                // Eliminar múltiples prescripciones
                for (const prescription of prescriptionsToDelete) {
                    await prescriptionService.deletePrescription(prescription._id);
                }
                // Actualizar el estado local después de eliminar todas
                const idsToDelete = prescriptionsToDelete.map(p => p._id);
                setPrescriptions(prev => prev.filter(p => !idsToDelete.includes(p._id)));
            } else {
                // Eliminar una sola prescripción
                await prescriptionService.deletePrescription(prescriptionsToDelete.id);
                // Actualizar el estado local
                setPrescriptions(prev => prev.filter(p => p._id !== prescriptionsToDelete.id));
            }
        } catch (error) {
            console.error('Error deleting prescription(s):', error);
            // Aquí podrías mostrar un mensaje de error al usuario
        }
    };

    // Fetch prescriptions from API when component mounts
    useEffect(() => {
        fetchPrescriptions();
    }, []);

    // function to fetch prescriptions from the API
    const fetchPrescriptions = async () => {
        try {
            setIsLoading(true);
            const response = await prescriptionService.getAllPrescriptions();
            
            if (response.status) {
                // Process prescriptions to handle potential null fields
                const processedPrescriptions = response.data.map(prescription => {
                    return {
                        ...prescription,
                        doctor: prescription.doctor || { _id: 'unknown' },
                        patient: prescription.patient || { _id: 'unknown' }
                    };
                });
                
                setPrescriptions(processedPrescriptions);
                setError(null);
            } else {
                setError('Error al obtener prescripciones: ' + (response.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error fetching prescriptions:', error);
            setError('Error al cargar las prescripciones. Por favor, inténtelo de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    // Commented out mock data function for reference
    /*
    const fetchMockPrescriptions = async () => {
        try {
            // Usar el servicio en lugar de axios directamente
            const response = await prescriptionService.getMockPrescriptions();
            if (response.status) {
                const processedPrescriptions = response.data.map(prescription => {
                    return {
                        ...prescription,
                        doctor: prescription.doctor || { _id: 'unknown' },
                        patient: prescription.patient || { _id: 'unknown' }
                    };
                });
                setPrescriptions(processedPrescriptions);
            }
        } catch (error) {
            console.error('Error fetching mock prescriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };
    */

    return (
        <>
            <div className="container-fluid w-75">
                <NavigationMenu />
                <main className="mt-4">
                    {isLoading ? (
                        <div>Loading prescriptions data...</div>
                    ) : error ? (
                        <div className="alert alert-danger">{error}</div>
                    ) : (
                        <>
                            <PrescriptionKPI prescriptions={prescriptions} />
                            
                            <section>
                                <PrescriptionTable
                                    prescriptions={prescriptions}
                                    onDeletePrescriptions={handleDeletePrescriptions}
                                />
                            </section>
                        </>
                    )}
                </main>
            </div>
        </>
    );
};

export default PrescriptionList;