import React from 'react';
import { Patient, Doctor, Consultation, ClinicInfo, VitalSigns } from '../types';
import { calculateAge } from '../utils/dateUtils';

interface PrintablePatientHistoryProps {
  patient: Patient;
  doctor: Doctor;
  consultations: Consultation[];
  clinicInfo?: ClinicInfo;
}

const VitalSignsDisplay: React.FC<{ vitals: VitalSigns }> = ({ vitals }) => (
    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
        {vitals.systolicBP && vitals.diastolicBP && <p><span className="font-bold">T.A.:</span> {vitals.systolicBP}/{vitals.diastolicBP} mmHg</p>}
        {vitals.heartRate && <p><span className="font-bold">F.C.:</span> {vitals.heartRate} lpm</p>}
        {vitals.temperature && <p><span className="font-bold">Temp:</span> {vitals.temperature} °C</p>}
        {vitals.weight && <p><span className="font-bold">Peso:</span> {vitals.weight} kg</p>}
        {vitals.height && <p><span className="font-bold">Talla:</span> {vitals.height} m</p>}
        {vitals.bmi && <p><span className="font-bold">IMC:</span> {vitals.bmi}</p>}
    </div>
);


const PrintablePatientHistory: React.FC<PrintablePatientHistoryProps> = React.forwardRef<HTMLDivElement, PrintablePatientHistoryProps>(({ patient, doctor, consultations, clinicInfo }, ref) => {
  const patientAge = calculateAge(patient.dob);
  const sortedConsultations = [...consultations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div ref={ref} id="printable-history" className="p-4 sm:p-6 font-serif bg-white text-black text-sm">
      <header className="text-center pb-2 border-b-2 border-black">
        <div className="flex justify-center items-center gap-4">
            {clinicInfo?.logo && <img src={clinicInfo.logo} alt="Logo" className="h-16 w-auto"/>}
            <div>
                <h1 className="text-xl font-bold">{clinicInfo?.name || 'CONSULTORIO MÉDICO'}</h1>
                <p className="text-xs">{clinicInfo?.address}</p>
                <p className="text-xs">TEL. {clinicInfo?.phone}</p>
            </div>
        </div>
      </header>
      
      <main className="mt-4">
        <h2 className="text-2xl font-bold text-center mb-4">HISTORIA CLÍNICA</h2>
        
        <section className="border-y-2 border-black py-2 text-xs">
            <div className="grid grid-cols-2 gap-x-4">
                <p><span className="font-bold">PACIENTE:</span> {patient.name}</p>
                <p><span className="font-bold">FECHA DE NAC.:</span> {new Date(`${patient.dob}T00:00:00`).toLocaleDateString('es-MX')}</p>
                <p><span className="font-bold">EDAD:</span> {patientAge?.toUpperCase()}</p>
                <p><span className="font-bold">GÉNERO:</span> {patient.gender}</p>
                <p><span className="font-bold">CONTACTO:</span> {patient.contact}</p>
            </div>
             {patient.allergies && patient.allergies.toUpperCase() !== 'NINGUNA' && patient.allergies.toUpperCase() !== 'NEGADAS' && (
                <div className="mt-2 text-center border border-red-600 p-1">
                    <p className="font-bold text-red-700">ALERGIAS: {patient.allergies}</p>
                </div>
            )}
        </section>
        
        <section className="mt-4 text-xs space-y-2">
            <h3 className="font-bold text-sm border-b">ANTECEDENTES</h3>
            <p><span className="font-bold">Heredo-Familiares:</span> {patient.familyHistory}</p>
            <p><span className="font-bold">Personales Patológicos:</span> {patient.pathologicalHistory}</p>
            <p><span className="font-bold">Personales No Patológicos:</span> {patient.nonPathologicalHistory}</p>
            <p><span className="font-bold">Quirúrgicos:</span> {patient.surgicalHistory}</p>
            {patient.gender === 'Femenino' && <p><span className="font-bold">Gineco-Obstétricos:</span> {patient.gynecologicalHistory}</p>}
        </section>

        <section className="mt-4">
             <h3 className="font-bold text-sm border-b mb-2">HISTORIAL DE CONSULTAS</h3>
             <div className="space-y-4">
                {sortedConsultations.map(c => (
                    <div key={c.id} className="p-2 border rounded-md text-xs break-inside-avoid">
                        <p className="font-bold text-sm bg-slate-100 p-1 rounded-t-md">FECHA: {new Date(c.date).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}</p>
                        <div className="p-2 space-y-1">
                            <p><span className="font-bold">Motivo:</span> {c.reason}</p>
                            {c.vitalSigns && Object.keys(c.vitalSigns).length > 0 && (
                                <div>
                                    <p className="font-bold">Signos Vitales:</p>
                                    <div className="pl-4">
                                        <VitalSignsDisplay vitals={c.vitalSigns} />
                                    </div>
                                </div>
                            )}
                            <p><span className="font-bold">Examen Físico:</span> {c.physicalExam}</p>
                            <p><span className="font-bold">Diagnóstico:</span> {c.diagnosis}</p>
                             {c.prescription && c.prescription.medications.length > 0 && (
                                <div>
                                    <p className="font-bold">Tratamiento:</p>
                                    <ul className="list-disc pl-8">
                                        {c.prescription.medications.map((m, i) => <li key={i}>{m.name} - {m.indication}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
             </div>
        </section>
      </main>
      <style>{`
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .break-inside-avoid {
                    page-break-inside: avoid;
                }
            }
        `}</style>
    </div>
  );
});

export default PrintablePatientHistory;