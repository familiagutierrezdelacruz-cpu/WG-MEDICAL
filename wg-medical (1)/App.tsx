import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Patient, Doctor, Consultation, AppSettings } from './types';
import { saveData, loadData } from './services/storageService';
import { fetchMedications } from './services/medicationService';
import DoctorSelection from './components/DoctorSelection';
import PatientList from './components/PatientList';
import PatientDetail from './components/PatientDetail';

const App: React.FC = () => {
  // State management
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const savedDoctors = loadData<Doctor[]>('doctors');
    if (savedDoctors && savedDoctors.length > 0) {
        return savedDoctors;
    }
    // Default doctor profile if none exists
    return [{
        id: uuidv4(),
        name: 'WILBER GUTIERREZ LEON',
        professionalLicense: '6758618',
        university: 'UNACH',
        diplomados: 'COLPOSCOPIA, ULTRASONIDO MEDICO',
        hasSpecialty: false,
        password: '1234'
    }];
  });

  const [patients, setPatients] = useState<Patient[]>(() => loadData<Patient[]>('patients') || []);
  const [consultations, setConsultations] = useState<Consultation[]>(() => loadData<Consultation[]>('consultations') || []);
  const [settings, setSettings] = useState<AppSettings>(() => {
      const savedSettings = loadData<AppSettings>('settings');
      if (savedSettings) return savedSettings;
      // Default clinic info
      return {
          medicationsUrl: '',
          clinicInfo: {
              name: 'ULTRAMED',
              address: 'AVENIDA 12 DE OCTUBRE SN, COL. VICENTE GUERRERO, OCOZOCOAUTLA',
              phone: '',
              slogan: 'ULTRASONIDO MEDICO DIAGNOSTICO'
          }
      }
  });
  const [medicationList, setMedicationList] = useState<string[]>([]);
  
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // One-time migration for existing patients without a doctorId
  useEffect(() => {
    const allPatients = loadData<Patient[]>("patients") || [];
    if (allPatients.length > 0 && doctors.length > 0) {
        const needsMigration = allPatients.some(p => !p.doctorId);
        if (needsMigration) {
            console.log("Running migration: Assigning existing patients to the default doctor.");
            const defaultDoctorId = doctors[0].id;
            const migratedPatients = allPatients.map(p => 
                p.doctorId ? p : { ...p, doctorId: defaultDoctorId }
            );
            saveData('patients', migratedPatients);
            setPatients(migratedPatients);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial mount


  // Load data and fetch medications on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      if (settings.medicationsUrl) {
        const meds = await fetchMedications(settings.medicationsUrl);
        setMedicationList(meds);
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, [settings.medicationsUrl]);
  
  // Data persistence effects
  useEffect(() => { saveData('doctors', doctors); }, [doctors]);
  useEffect(() => { saveData('patients', patients); }, [patients]);
  useEffect(() => { saveData('consultations', consultations); }, [consultations]);
  useEffect(() => { saveData('settings', settings); }, [settings]);
  
  // Doctor handlers
  const handleAddDoctor = (doctorData: Omit<Doctor, 'id'>) => {
    setDoctors(prev => [...prev, { ...doctorData, id: uuidv4() }]);
  };
  const handleUpdateDoctor = (updatedDoctor: Doctor) => {
    setDoctors(prev => prev.map(d => d.id === updatedDoctor.id ? updatedDoctor : d));
  };
  const handleSelectDoctor = (doctor: Doctor) => {
    setCurrentDoctor(doctor);
  };
  const handleSwitchDoctor = () => {
    setCurrentDoctor(null);
    setSelectedPatient(null);
  };

  // Patient handlers
  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'doctorId'>) => {
    if (!currentDoctor) {
        console.error("Cannot add patient without a selected doctor.");
        return;
    }
    const newPatient = { ...patientData, id: uuidv4(), doctorId: currentDoctor.id };
    setPatients(prev => [...prev, newPatient]);
  };
  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    if (selectedPatient?.id === updatedPatient.id) {
        setSelectedPatient(updatedPatient);
    }
  };
  const handleSelectPatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
    }
  };
  const handleBackToList = () => {
    setSelectedPatient(null);
  };

  // Consultation handlers
  const handleAddConsultation = (consultationData: Omit<Consultation, 'id'>) => {
    const newConsultation = { ...consultationData, id: uuidv4() };
    setConsultations(prev => [...prev, newConsultation]);
  };
  const handleUpdateConsultation = (updatedConsultation: Consultation) => {
    setConsultations(prev => prev.map(c => c.id === updatedConsultation.id ? updatedConsultation : c));
  };
  
  // Settings handler
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  if (isLoading) {
      return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><p>Cargando aplicación...</p></div>;
  }

  // View rendering logic
  if (!currentDoctor) {
    return (
      <DoctorSelection 
        doctors={doctors}
        onSelectDoctor={handleSelectDoctor}
        onAddDoctor={handleAddDoctor}
        onUpdateDoctor={handleUpdateDoctor}
      />
    );
  }
  
  if (!selectedPatient) {
    // Filter patients and consultations to only show data for the current doctor
    const doctorPatients = patients.filter(p => p.doctorId === currentDoctor.id);
    const doctorConsultations = consultations.filter(c => c.doctorId === currentDoctor.id);

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          <PatientList
            patients={doctorPatients}
            doctor={currentDoctor}
            settings={settings}
            consultations={doctorConsultations}
            onSelectPatient={handleSelectPatient}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onSwitchDoctor={handleSwitchDoctor}
            onSaveSettings={handleSaveSettings}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl">
        <PatientDetail
          patient={selectedPatient}
          consultations={consultations.filter(c => c.patientId === selectedPatient.id)}
          doctor={currentDoctor}
          clinicInfo={settings.clinicInfo}
          medications={medicationList}
          onBack={handleBackToList}
          onUpdatePatient={handleUpdatePatient}
          onAddConsultation={handleAddConsultation}
          onUpdateConsultation={handleUpdateConsultation}
        />
      </div>
    </div>
  );
};

export default App;