import React, { useState, useMemo } from 'react';
import { Patient, Doctor, AppSettings, Consultation } from '../types';
import Modal from './Modal';
import PatientForm from './PatientForm';
import SettingsModal from './SettingsModal';
import AppointmentsReportModal from './AppointmentsReportModal';
import UpcomingAppointmentsReportModal from './UpcomingAppointmentsReportModal';
import DemographicsReportModal from './DemographicsReportModal'; // Import the new component
import { SwitchUserIcon } from './icons/SwitchUserIcon';
import { CogIcon } from './icons/CogIcon';
import { PlusIcon } from './icons/PlusIcon';
import { DocumentChartBarIcon } from './icons/DocumentChartBarIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { ChartBarIcon } from './icons/ChartBarIcon'; // Import the new icon
import { parseLocalDate } from '../utils/dateUtils';
import { InformationCircleIcon } from './icons/InformationCircleIcon';

interface PatientListProps {
  patients: Patient[];
  doctor: Doctor;
  settings: AppSettings;
  consultations: Consultation[];
  onSelectPatient: (patientId: string) => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'doctorId'>) => void;
  onUpdatePatient: (patient: Patient) => void;
  onSwitchDoctor: () => void;
  onSaveSettings: (settings: AppSettings) => void;
}

const PatientList: React.FC<PatientListProps> = ({
  patients,
  doctor,
  settings,
  consultations,
  onSelectPatient,
  onAddPatient,
  onUpdatePatient,
  onSwitchDoctor,
  onSaveSettings
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAppointmentsReportModalOpen, setIsAppointmentsReportModalOpen] = useState(false);
  const [isUpcomingAppointmentsModalOpen, setIsUpcomingAppointmentsModalOpen] = useState(false);
  const [isDemographicsReportModalOpen, setIsDemographicsReportModalOpen] = useState(false); // State for the new modal
  const [showAlert, setShowAlert] = useState(true);

  const appointmentsToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return consultations.filter(c => {
        if (!c.nextAppointment) return false;
        const appointmentDate = parseLocalDate(c.nextAppointment);
        return appointmentDate.getTime() === today.getTime();
    });
  }, [consultations]);

  const filteredPatients = useMemo(() => {
    const sortedPatients = [...patients].sort((a, b) => a.name.localeCompare(b.name));
    if (!searchQuery) return sortedPatients;
    return sortedPatients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [patients, searchQuery]);
  
  // FIX: Updated the type of `patientData` to `Omit<Patient, 'id' | 'doctorId'> | Patient` to align with the change in PatientForm's `onSave` prop and ensure type safety when adding new patients.
  const handleSavePatient = (patientData: Omit<Patient, 'id' | 'doctorId'> | Patient) => {
    if ('id' in patientData) {
        onUpdatePatient(patientData as Patient);
    } else {
        onAddPatient(patientData);
    }
    setIsPatientModalOpen(false);
  };
  
  const handleSaveSettingsAndClose = (newSettings: AppSettings) => {
      onSaveSettings(newSettings);
      setIsSettingsModalOpen(false);
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <header className="mb-6 pb-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <p className="text-sm text-slate-500">Médico en turno</p>
            <h1 className="text-3xl font-bold text-slate-800">{doctor.name}</h1>
            <p className="text-slate-600">{doctor.hasSpecialty ? doctor.specialtyName : 'Médico General'}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button onClick={onSwitchDoctor} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">
              <SwitchUserIcon className="w-4 h-4" />
              <span>Cambiar Médico</span>
            </button>
            <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">
              <CogIcon className="w-4 h-4" />
              <span>Configuración</span>
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button onClick={() => setIsAppointmentsReportModalOpen(true)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-slate-50 text-slate-600 rounded-md hover:bg-slate-100 border transition-colors w-full sm:w-auto">
                <DocumentChartBarIcon className="w-4 h-4" />
                <span>Reporte de Consultas</span>
            </button>
            <button onClick={() => setIsUpcomingAppointmentsModalOpen(true)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-slate-50 text-slate-600 rounded-md hover:bg-slate-100 border transition-colors w-full sm:w-auto">
                <CalendarDaysIcon className="w-4 h-4" />
                <span>Próximas Citas</span>
            </button>
            <button onClick={() => setIsDemographicsReportModalOpen(true)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-slate-50 text-slate-600 rounded-md hover:bg-slate-100 border transition-colors w-full sm:w-auto">
                <ChartBarIcon className="w-4 h-4" />
                <span>Reporte Demográfico</span>
            </button>
        </div>
      </header>
      
      {showAlert && appointmentsToday.length > 0 && (
          <div className="mb-4 p-3 border-l-4 border-blue-500 bg-blue-50 text-blue-800 rounded-r-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <InformationCircleIcon className="w-6 h-6 text-blue-500 shrink-0"/>
                  <div>
                    <p className="font-semibold">Tiene {appointmentsToday.length} cita(s) programada(s) para hoy.</p>
                    <button onClick={() => setIsUpcomingAppointmentsModalOpen(true)} className="text-sm font-bold text-blue-600 hover:underline">
                        Ver Citas de Hoy
                    </button>
                  </div>
              </div>
              <button onClick={() => setShowAlert(false)} className="text-2xl font-bold text-blue-500 hover:text-blue-700">&times;</button>
          </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <input 
          type="text"
          placeholder="Buscar paciente por nombre..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={() => setIsPatientModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <PlusIcon className="w-5 h-5" />
          <span>Añadir Paciente</span>
        </button>
      </div>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <div 
              key={patient.id} 
              onClick={() => onSelectPatient(patient.id)}
              className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <h3 className="font-semibold text-lg text-slate-800">{patient.name}</h3>
              <p className="text-sm text-slate-500">Fecha de Nac.: {new Date(`${patient.dob}T00:00:00`).toLocaleDateString('es-MX')} - Contacto: {patient.contact}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-10 border-dashed border-2 rounded-lg">
            <p className="text-slate-500">
                {searchQuery ? 'No se encontraron pacientes con ese nombre.' : 'No hay pacientes registrados.'}
            </p>
            {!searchQuery && <p className="text-sm text-slate-400 mt-1">Haga clic en "Añadir Paciente" para comenzar.</p>}
          </div>
        )}
      </div>
      
      <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} size="2xl">
        <PatientForm onSave={handleSavePatient} onCancel={() => setIsPatientModalOpen(false)} />
      </Modal>

      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} size="2xl">
        <SettingsModal settings={settings} onSave={handleSaveSettingsAndClose} onClose={() => setIsSettingsModalOpen(false)} />
      </Modal>

      <Modal isOpen={isAppointmentsReportModalOpen} onClose={() => setIsAppointmentsReportModalOpen(false)} size="4xl">
          <AppointmentsReportModal 
            consultations={consultations}
            patients={patients}
            onClose={() => setIsAppointmentsReportModalOpen(false)}
          />
      </Modal>

      <Modal isOpen={isUpcomingAppointmentsModalOpen} onClose={() => setIsUpcomingAppointmentsModalOpen(false)} size="4xl">
        <UpcomingAppointmentsReportModal 
            consultations={consultations}
            patients={patients}
            onClose={() => setIsUpcomingAppointmentsModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={isDemographicsReportModalOpen} onClose={() => setIsDemographicsReportModalOpen(false)} size="3xl">
        <DemographicsReportModal 
            patients={patients}
            onClose={() => setIsDemographicsReportModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default PatientList;