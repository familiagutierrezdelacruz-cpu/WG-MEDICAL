import React, { useState } from 'react';
import { Doctor } from '../types';
import DoctorForm from './DoctorForm';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';

interface DoctorManagementModalProps {
  doctors: Doctor[];
  onAddDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  onUpdateDoctor: (doctor: Doctor) => void;
  onClose: () => void;
}

const DoctorManagementModal: React.FC<DoctorManagementModalProps> = ({ doctors, onAddDoctor, onUpdateDoctor, onClose }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const handleAddNew = () => {
    setEditingDoctor(null);
    setIsFormVisible(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsFormVisible(true);
  };

  const handleSaveDoctor = (doctorData: Omit<Doctor, 'id'> | Doctor) => {
    if ('id' in doctorData) {
      onUpdateDoctor(doctorData as Doctor);
    } else {
      onAddDoctor(doctorData);
    }
    setIsFormVisible(false);
    setEditingDoctor(null);
  };

  return (
    <div className="p-1 max-h-[85vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestión de Médicos</h2>
      
      {isFormVisible ? (
        <DoctorForm 
          doctor={editingDoctor || undefined}
          onSave={handleSaveDoctor}
          onCancel={() => setIsFormVisible(false)}
        />
      ) : (
        <>
          <ul className="space-y-3 mb-6">
            {doctors.map(doctor => (
              <li key={doctor.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                <div>
                  <p className="font-semibold text-slate-800">{doctor.name}</p>
                  <p className="text-sm text-slate-500">{doctor.hasSpecialty ? doctor.specialtyName : 'Médico General'}</p>
                </div>
                <button onClick={() => handleEdit(doctor)} className="p-2 text-slate-600 hover:text-blue-600 rounded-md hover:bg-slate-200">
                  <PencilIcon className="w-5 h-5"/>
                </button>
              </li>
            ))}
             {doctors.length === 0 && <p className="text-center text-slate-500 py-4">No hay médicos registrados.</p>}
          </ul>
          <div className="flex justify-between items-center">
            <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cerrar</button>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <PlusIcon className="w-5 h-5"/>
              <span>Añadir Médico</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorManagementModal;