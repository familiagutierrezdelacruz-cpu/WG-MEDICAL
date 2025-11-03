import React, { useState } from 'react';
import { Patient, Consultation, Doctor, ClinicInfo } from '../types';
import { calculateAge } from '../utils/dateUtils';
import Modal from './Modal';
import PatientForm from './PatientForm';
import ConsultationForm from './ConsultationForm';
import NewWindow from './NewWindow';
import PrintablePrescription from './PrintablePrescription';
import PrintableUltrasoundReport from './PrintableUltrasoundReport';
import PrintablePatientHistory from './PrintablePatientHistory';

import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { PencilIcon } from './icons/PencilIcon';
import { PlusIcon } from './icons/PlusIcon';
import { PrintIcon } from './icons/PrintIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';


interface PatientDetailProps {
  patient: Patient;
  consultations: Consultation[];
  doctor: Doctor;
  clinicInfo?: ClinicInfo;
  medications: string[];
  onBack: () => void;
  onUpdatePatient: (patient: Patient) => void;
  onAddConsultation: (consultation: Omit<Consultation, 'id'>) => void;
  onUpdateConsultation: (consultation: Consultation) => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  consultations,
  doctor,
  clinicInfo,
  medications,
  onBack,
  onUpdatePatient,
  onAddConsultation,
  onUpdateConsultation,
}) => {
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  
  const [printingDoc, setPrintingDoc] = useState<{ type: 'prescription' | 'ultrasound' | 'history', data: any } | null>(null);

  const sortedConsultations = [...consultations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const patientAge = calculateAge(patient.dob);

  // FIX: Updated the type of `patientData` to `Omit<Patient, 'id' | 'doctorId'> | Patient` to align with the change in PatientForm's `onSave` prop.
  const handleSavePatient = (patientData: Omit<Patient, 'id' | 'doctorId'> | Patient) => {
    if ('id' in patientData) {
      onUpdatePatient(patientData as Patient);
    }
    setIsPatientModalOpen(false);
  };
  
  const handleSaveConsultation = (consultationData: Omit<Consultation, 'id'> | Consultation) => {
    if ('id' in consultationData) {
        onUpdateConsultation(consultationData as Consultation);
    } else {
        onAddConsultation(consultationData);
    }
    setIsConsultationModalOpen(false);
    setEditingConsultation(null);
  };

  const handleAddNewConsultation = () => {
    setEditingConsultation(null);
    setIsConsultationModalOpen(true);
  };

  const handleEditConsultation = (consultation: Consultation) => {
    setEditingConsultation(consultation);
    setIsConsultationModalOpen(true);
  };
  
  const handlePrintPrescription = (consultation: Consultation) => {
    setPrintingDoc({ type: 'prescription', data: consultation });
  };
  
  const handlePrintUltrasound = (consultation: Consultation) => {
      setPrintingDoc({ type: 'ultrasound', data: consultation });
  };

  const handlePrintHistory = () => {
      setPrintingDoc({ type: 'history', data: null });
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <header className="mb-6 pb-4 border-b">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-2">
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Volver a la lista de pacientes</span>
            </button>
            <h1 className="text-3xl font-bold text-slate-800">{patient.name}</h1>
            <p className="text-slate-600">{patientAge} - {patient.gender} - Contacto: {patient.contact}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setIsPatientModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">
                <PencilIcon className="w-4 h-4" />
                <span>Editar Paciente</span>
            </button>
            <button onClick={handlePrintHistory} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200">
                <ClipboardDocumentListIcon className="w-4 h-4" />
                <span>Imprimir Historia</span>
            </button>
            <button onClick={handleAddNewConsultation} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <PlusIcon className="w-5 h-5" />
              <span>Nueva Consulta</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <aside className="lg:col-span-1 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border">
                <h3 className="font-semibold text-slate-800 border-b pb-2 mb-2 flex items-center gap-2"><InformationCircleIcon className="w-5 h-5"/>Información del Paciente</h3>
                <div className="space-y-1 text-sm text-slate-600">
                    <p><strong className="font-medium text-slate-700">Alergias:</strong> {patient.allergies || 'No registradas'}</p>
                    <p><strong className="font-medium text-slate-700">Ant. Familiares:</strong> {patient.familyHistory}</p>
                    <p><strong className="font-medium text-slate-700">Ant. Patológicos:</strong> {patient.pathologicalHistory}</p>
                    <p><strong className="font-medium text-slate-700">Ant. No Patológicos:</strong> {patient.nonPathologicalHistory}</p>
                    <p><strong className="font-medium text-slate-700">Ant. Quirúrgicos:</strong> {patient.surgicalHistory}</p>
                    {patient.gender === 'Femenino' && <p><strong className="font-medium text-slate-700">Ant. Ginecológicos:</strong> {patient.gynecologicalHistory}</p>}
                </div>
            </div>
        </aside>

        <main className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Historial de Consultas</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {sortedConsultations.length > 0 ? (
                    sortedConsultations.map(consult => (
                        <div key={consult.id} className="p-4 border rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-blue-700">{new Date(consult.date).toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' })}</p>
                                    <p className="text-sm text-slate-500">Atendido por: {doctor.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     {consult.prescription && (consult.prescription.medications.length > 0 || (consult.prescription.instructions && consult.prescription.instructions.trim().length > 0)) && (
                                        <button onClick={() => handlePrintPrescription(consult)} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200"><PrintIcon className="w-4 h-4"/>Receta</button>
                                     )}
                                     {consult.ultrasoundReportType && (
                                         <button onClick={() => handlePrintUltrasound(consult)} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200">
                                            <DocumentTextIcon className="w-4 h-4"/>
                                            <span>Reporte USG</span>
                                            {consult.ultrasoundImages && consult.ultrasoundImages.length > 0 && <span className="text-blue-600 font-bold">({consult.ultrasoundImages.length})</span>}
                                        </button>
                                     )}
                                    <button onClick={() => handleEditConsultation(consult)} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded hover:bg-slate-200"><PencilIcon className="w-4 h-4"/>Editar</button>
                                </div>
                            </div>
                            <div className="mt-3 space-y-2 text-sm">
                                <p><strong className="font-medium text-slate-700">Motivo:</strong> {consult.reason}</p>
                                <p><strong className="font-medium text-slate-700">Diagnóstico:</strong> {consult.diagnosis}</p>
                                {consult.nextAppointment && <p className="font-semibold text-amber-700 bg-amber-50 p-2 rounded-md">Próxima cita: {new Date(`${consult.nextAppointment}T00:00:00`).toLocaleDateString('es-MX', { dateStyle: 'long' })}</p>}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 border-dashed border-2 rounded-lg">
                        <p className="text-slate-500">No hay consultas registradas para este paciente.</p>
                        <p className="text-sm text-slate-400 mt-1">Haga clic en "Nueva Consulta" para comenzar.</p>
                    </div>
                )}
            </div>
        </main>
      </div>
      
      <Modal isOpen={isPatientModalOpen} onClose={() => setIsPatientModalOpen(false)} size="2xl">
        <PatientForm patient={patient} onSave={handleSavePatient} onCancel={() => setIsPatientModalOpen(false)} />
      </Modal>
      
      <Modal isOpen={isConsultationModalOpen} onClose={() => { setIsConsultationModalOpen(false); setEditingConsultation(null); }} size="4xl">
          <ConsultationForm 
            patient={patient}
            doctor={doctor}
            consultation={editingConsultation || undefined}
            medications={medications}
            onSave={handleSaveConsultation}
            onCancel={() => { setIsConsultationModalOpen(false); setEditingConsultation(null); }}
          />
      </Modal>
      
      {printingDoc?.type === 'prescription' && (
          <NewWindow onClose={() => setPrintingDoc(null)} title="Receta Médica">
              <PrintablePrescription patient={patient} doctor={doctor} consultation={printingDoc.data} clinicInfo={clinicInfo} />
          </NewWindow>
      )}
      {printingDoc?.type === 'ultrasound' && (
          <NewWindow onClose={() => setPrintingDoc(null)} title="Reporte de Ultrasonido">
              <PrintableUltrasoundReport patient={patient} doctor={doctor} consultation={printingDoc.data} clinicInfo={clinicInfo} />
          </NewWindow>
      )}
      {printingDoc?.type === 'history' && (
          <NewWindow onClose={() => setPrintingDoc(null)} title={`Historia Clínica - ${patient.name}`}>
              <PrintablePatientHistory patient={patient} doctor={doctor} consultations={consultations} clinicInfo={clinicInfo} />
          </NewWindow>
      )}

    </div>
  );
};

export default PatientDetail;