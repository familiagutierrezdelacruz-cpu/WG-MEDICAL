import React, { useState } from 'react';
import { Doctor } from '../types';
import Modal from './Modal';
import DoctorManagementModal from './DoctorManagementModal';
import { StethoscopeIcon } from './icons/StethoscopeIcon';
import { UserIcon } from './icons/UserIcon';
import { KeyIcon } from './icons/KeyIcon';

interface DoctorSelectionProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
  onAddDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  onUpdateDoctor: (doctor: Doctor) => void;
}

const DoctorSelection: React.FC<DoctorSelectionProps> = ({ doctors, onSelectDoctor, onAddDoctor, onUpdateDoctor }) => {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedDoctorForLogin, setSelectedDoctorForLogin] = useState<Doctor | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSelect = (doctor: Doctor) => {
    setSelectedDoctorForLogin(doctor);
    setError('');
    setPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctorForLogin && selectedDoctorForLogin.password === password) {
      onSelectDoctor(selectedDoctorForLogin);
    } else {
      setError('Contraseña incorrecta. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <StethoscopeIcon className="w-16 h-16 mx-auto text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800 mt-4">Bienvenido</h1>
          <p className="text-slate-500">Seleccione el médico para iniciar turno</p>
        </div>
        
        <div className="space-y-4">
          {doctors.length > 0 ? (
            doctors.map(doctor => (
              <button
                key={doctor.id}
                onClick={() => handleSelect(doctor)}
                className="w-full flex items-center gap-4 p-4 text-left bg-slate-50 rounded-lg border hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                <UserIcon className="w-8 h-8 text-slate-400" />
                <div>
                  <p className="font-bold text-lg text-slate-800">{doctor.name}</p>
                  <p className="text-sm text-slate-500">{doctor.hasSpecialty ? doctor.specialtyName : 'Médico General'}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center p-6 border-2 border-dashed rounded-lg">
                <p className="text-slate-500">No hay médicos registrados.</p>
                <p className="text-sm text-slate-400 mt-1">Haga clic en "Gestionar Médicos" para añadir el primero.</p>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t">
          <button
            onClick={() => setIsManageModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
          >
            <KeyIcon className="w-5 h-5" />
            <span>Gestionar Médicos</span>
          </button>
        </div>
      </div>
      
      <Modal isOpen={isManageModalOpen} onClose={() => setIsManageModalOpen(false)} size="2xl">
        <DoctorManagementModal 
          doctors={doctors}
          onAddDoctor={onAddDoctor}
          onUpdateDoctor={onUpdateDoctor}
          onClose={() => setIsManageModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!selectedDoctorForLogin} onClose={() => setSelectedDoctorForLogin(null)} size="lg">
        {selectedDoctorForLogin && (
            <form onSubmit={handleLogin} className="p-2">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Iniciar Sesión</h2>
                <p className="text-slate-600 mb-4">Médico: <span className="font-bold">{selectedDoctorForLogin.name}</span></p>
                
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                    <div className="relative mt-1">
                        <KeyIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            required
                        />
                    </div>
                </div>

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <button type="button" onClick={() => setSelectedDoctorForLogin(null)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Ingresar</button>
                </div>
            </form>
        )}
      </Modal>
    </div>
  );
};

export default DoctorSelection;