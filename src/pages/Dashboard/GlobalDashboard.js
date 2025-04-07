import React from "react";
import { Link } from "react-router-dom";

const GlobalDashboard = () => {
  const token = localStorage.getItem("token");

  const modules = [
    { name: "Doctor", link: "/doctors/list", icon: "👨‍⚕️", responosible:"Oscar Garcia Mayoral" },
    { name: "Patient", link: "/patients/list", icon: "🏥", responosible:"Xinjie Pan", updatedon:"07-04-2025" },
    { name: "Treatments", link: "/treatments", icon: "💉",responosible:"Bo Xu" },
    { name: "Health Centers", link: "/healthcenters", icon: "🏥", responosible:"Alvaro Muñoz Nuñez" },
    { name: "Medicines", link: "/medicines", icon: "💊", responosible:"Alejandro Oliva" },
    { name: "Inventory", link: "/inventory", icon: "📦", responosible:""},
    { name: "Prescriptions", link: "/prescriptions", icon: "📝", responosible:"Rodrigo Donoso", updatedon:"07-04-2025" },
    { name: "Vaccination", link: "/vaccination", icon: "💉", responosible:"Adrian Zambrano" },
    { name: "Appointments", link: "/appointments", icon: "📅", responosible:"Santiago Gomez" },
    { name: "Timeline", link: "/timeline", icon: "⏱️", responosible:"" },
  ];

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Dashboard</h1>
      <div className="row g-4">
        {modules.map((module, index) => (
          <div key={index} className="col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              <div className="card-body text-center">
                <h1 className="mb-3">{module.icon}</h1>
                <h5 className="card-title">{module.name}</h5>
                <p className="text-muted small mb-3">
                  {module.responosible || "Not assigned"}
                </p>
                <p className="text-muted small mb-3">
                  {module.updatedon || "Not updated"}
                </p>
                <Link 
                  to={module.link} 
                  className={`btn ${module.updatedon ? 'btn-success' : 'btn-primary'} mt-3`}
                >
                  Go to {module.name}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GlobalDashboard;
