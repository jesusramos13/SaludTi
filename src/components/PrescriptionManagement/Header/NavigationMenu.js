import React, { useState } from 'react';

const NavigationMenu = () => {
  const [activeItem, setActiveItem] = useState('Prescriptions');

  const menuItems = [
    'Doctors',
    'Patients', 
    'Treatments',
    'Health Centers', 
    'Medicines', 
    'Inventory', 
    'Prescriptions',
    'Vaccination', 
    'Appointments'
  ];

  return (
    <div className="bg-white border-bottom">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-start">
          {menuItems.map((item) => (
            <div 
              key={item}
              className={`
                px-3 
                py-3 
                text-nowrap 
                cursor-pointer 
                ${activeItem === item 
                  ? 'text-primary border-bottom border-2 border-primary fw-semibold' 
                  : 'text-muted'}
              `}
              onClick={() => setActiveItem(item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NavigationMenu;