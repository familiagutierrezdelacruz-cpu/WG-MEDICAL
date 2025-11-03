
import React from 'react';
import { Patient, Doctor, Consultation, ClinicInfo, VitalSigns } from '../types';
import { calculateAge, parseLocalDate } from '../utils/dateUtils';

interface PrintablePrescriptionProps {
  patient: Patient;
  doctor: Doctor;
  consultation: Consultation;
  clinicInfo?: ClinicInfo;
}

const VitalSignsDisplay: React.FC<{ vitals: VitalSigns }> = ({ vitals }) => (
    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
        {vitals.systolicBP && vitals.diastolicBP && <p><span className="font-bold">T.A.:</span> {vitals.systolicBP}/{vitals.diastolicBP} mmHg</p>}
        {vitals.heartRate && <p><span className="font-bold">F.C.:</span> {vitals.heartRate} lpm</p>}
        {vitals.respiratoryRate && <p><span className="font-bold">F.R.:</span> {vitals.respiratoryRate} rpm</p>}
        {vitals.temperature && <p><span className="font-bold">Temp:</span> {vitals.temperature} °C</p>}
        {vitals.oxygenSaturation && <p><span className="font-bold">Sat O₂:</span> {vitals.oxygenSaturation} %</p>}
        {vitals.glucose && <p><span className="font-bold">Glucosa:</span> {vitals.glucose} mg/dL</p>}
        {vitals.weight && <p><span className="font-bold">Peso:</span> {vitals.weight} kg</p>}
        {vitals.height && <p><span className="font-bold">Talla:</span> {vitals.height} m</p>}
        {vitals.bmi && <p className="col-span-1"><span className="font-bold">IMC:</span> {vitals.bmi} <span className="text-xs">({vitals.bmiInterpretation})</span></p>}
    </div>
);


const PrintablePrescription: React.FC<PrintablePrescriptionProps> = React.forwardRef<HTMLDivElement, PrintablePrescriptionProps>(({ patient, doctor, consultation, clinicInfo }, ref) => {
  const consultDate = new Date(consultation.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  const patientAge = calculateAge(patient.dob);
  
  const nextAppointmentDate = consultation.nextAppointment 
    ? parseLocalDate(consultation.nextAppointment).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  return (
    <div ref={ref} id="printable-prescription" className="p-4 sm:p-6 font-serif bg-white text-black text-sm">
        <header className="text-center pb-2 border-b-2 border-black">
            <div className="flex justify-center items-center gap-4">
                {clinicInfo?.logo && <img src={clinicInfo.logo} alt="Logo" className="h-16 w-auto"/>}
                <div>
                    <h1 className="text-xl font-bold">{clinicInfo?.name || 'CONSULTORIO MÉDICO'}</h1>
                    <p className="text-xs">{clinicInfo?.address}</p>
                    <p className="text-xs">TEL. {clinicInfo?.phone}</p>
                    {clinicInfo?.slogan && <p className="text-xs italic">{clinicInfo.slogan}</p>}
                </div>
            </div>
            <div className="mt-2">
                 <p className="text-sm font-bold">{doctor.name}</p>
                 <p className="text-xs">{doctor.hasSpecialty ? doctor.specialtyName : 'MÉDICO GENERAL'} - {doctor.university}</p>
                 <p className="text-xs">CÉD. PROF. {doctor.professionalLicense} {doctor.hasSpecialty ? `| CÉD. ESP. ${doctor.specialtyLicense}` : ''}</p>
            </div>
        </header>

        <section className="mt-4 flex justify-between items-start text-xs border-b pb-2">
            <div>
                <p><span className="font-bold">PACIENTE:</span> {patient.name}</p>
                {patientAge && <p><span className="font-bold">EDAD:</span> {patientAge.toUpperCase()}</p>}
            </div>
            <p className="text-right"><span className="font-bold">FECHA:</span> {consultDate}</p>
        </section>
        
        {patient.allergies && patient.allergies !== 'NINGUNA' && (
             <section className="mt-2 p-1 border-2 border-red-600 rounded-md text-center">
                <p className="font-bold text-red-700 text-xs">ALERGIAS: {patient.allergies}</p>
            </section>
        )}
        
        {consultation.vitalSigns && (
             <section className="mt-2 border-b pb-2">
                <h3 className="font-bold text-xs mb-1">SIGNOS VITALES:</h3>
                <VitalSignsDisplay vitals={consultation.vitalSigns} />
            </section>
        )}

        <main className="mt-2 min-h-[300px]">
            <h2 className="text-xl font-bold text-center mb-2">RECETA MÉDICA</h2>
            
            <p className="text-xs"><span className="font-bold">DIAGNÓSTICO:</span> {consultation.diagnosis}</p>
            
            <div className="mt-2 space-y-2">
                {consultation.prescription.medications.map((med, index) => (
                  <div key={index}>
                    <p className="font-bold text-base">RX) {med.name.toUpperCase()}</p>
                    <p className="pl-5 text-sm">DOSIS / INDICACIÓN: {med.indication}</p>
                    <p className="pl-5 text-sm">VÍA DE ADMINISTRACIÓN: {med.route}</p>
                  </div>
                ))}
            </div>

            {consultation.prescription.instructions && (
                <div className="mt-3">
                    <h3 className="font-bold text-sm">INDICACIONES GENERALES:</h3>
                    <p className="whitespace-pre-wrap text-sm">{consultation.prescription.instructions}</p>
                </div>
            )}
             {consultation.labStudies && (
                <div className="mt-3">
                    <h3 className="font-bold text-sm">ESTUDIOS SOLICITADOS:</h3>
                    <p className="whitespace-pre-wrap text-sm">{consultation.labStudies}</p>
                </div>
            )}
        </main>

        <footer className="mt-4 pt-2 text-xs">
            {nextAppointmentDate && (
                <div className="text-right font-bold mb-4">
                    <p>PRÓXIMA CITA: {nextAppointmentDate}</p>
                </div>
            )}
            <div className="text-center font-bold text-red-700 bg-red-100 p-1 rounded">
                <p>ANTE DATOS DE ALARMA ACUDA DE INMEDIATO AL HOSPITAL MÁS CERCANO</p>
            </div>
            <div className="mt-12 text-center">
                <div className="inline-block border-t-2 border-black pt-1 px-12">
                    <p className="font-bold">{doctor.name}</p>
                    <p>FIRMA DEL MÉDICO</p>
                </div>
            </div>
        </footer>
        <style>{`
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                #printable-prescription {
                    font-size: 10pt;
                    padding: 0;
                    margin: 0;
                }
                #printable-prescription h1 { font-size: 14pt; }
                #printable-prescription h2 { font-size: 12pt; }
                #printable-prescription h3, #printable-prescription p, #printable-prescription div { font-size: 9pt; line-height: 1.2; }
                #printable-prescription header, #printable-prescription section, #printable-prescription main, #printable-prescription footer {
                    margin-top: 0.5rem;
                    padding-bottom: 0.25rem;
                }
                #printable-prescription main { min-height: 250px; }
            }
        `}</style>
    </div>
  );
});

export default PrintablePrescription;
