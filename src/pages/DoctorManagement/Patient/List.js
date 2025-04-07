import React, { useState } from "react";
import PatientsTable from "../../../components/ PatientComponents/list/PatientTable";
import DoctorList from "../../../components/DoctorManagement/List/DoctorList";

const Navigation = ({ activeTab, setActiveTab }) => {
    const tabs = [
        "Doctors", "Patients", "Treatments", "Health Center", "Medicines",
        "Inventory", "Prescriptions", "Vaccination", "Appointments", "Timeline"
    ];

    return (
        <nav className="nav nav-tabs mt-3 ">
            {tabs.map(tab => (
                <button
                    key={tab}
                    className={`nav-link ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                    style={{
                        cursor: "pointer",
                        color: "black",
                        borderBottom: activeTab === tab ? "2px solid blue" : "none",
                        border: "none",
                        flex: 1,
                        textAlign: "center",
                    }}
                >
                    {tab}
                </button>
            ))}
        </nav>
    );
};

const PatientList = () => {
    const [activeTab, setActiveTab] = useState("Patients");

    return (
        <section className="container-fluid w-75">
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="mt-4">
                {activeTab === "Patients" && <PatientsTable />}
                {activeTab === "Doctors" && <DoctorList/>}
                {activeTab === "Treatments" && <div>Treatments Component</div>}
                {activeTab === "Health Center" && <div>Health Center Component</div>}
                {activeTab === "Medicines" && <div>Medicines Component</div>}
                {activeTab === "Inventory" && <div>Inventory Component</div>}
                {activeTab === "Prescriptions" && <div>Prescriptions Component</div>}
                {activeTab === "Vaccination" && <div>Vaccination Component</div>}
                {activeTab === "Appointments" && <div>Appointments Component</div>}
                {activeTab === "Timeline" && <div>Timeline Component</div>}
            </main>
        </section>
    );
};

export default PatientList;
