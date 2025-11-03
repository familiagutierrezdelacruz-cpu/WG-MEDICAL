// FIX: Implemented the missing PrintableUltrasoundReport component.
import React from 'react';
import { Patient, Doctor, Consultation, ClinicInfo } from '../types';
import { calculateAge } from '../utils/dateUtils';

interface PrintableUltrasoundReportProps {
  patient: Patient;
  doctor: Doctor;
  consultation: Consultation;
  clinicInfo?: ClinicInfo;
}

const PrintableUltrasoundReport: React.FC<PrintableUltrasoundReportProps> = React.forwardRef<HTMLDivElement, PrintableUltrasoundReportProps>(({ patient, doctor, consultation, clinicInfo }, ref) => {
  const reportDate = new Date(consultation.date).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  const patientAge = calculateAge(patient.dob);

  return (
    <div ref={ref} id="printable-ultrasound-report" className="p-4 sm:p-6 font-serif bg-white text-black text-sm">
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
            {patientAge !== null && <p><span className="font-bold">EDAD:</span> {patientAge} AÑOS</p>}
        </div>
        <p className="text-right"><span className="font-bold">FECHA:</span> {reportDate}</p>
      </section>

      <main className="mt-4 min-h-[400px]">
        <h2 className="text-xl font-bold text-center mb-4">REPORTE DE ULTRASONIDO: {consultation.ultrasoundReportType?.toUpperCase()}</h2>
        
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-base border-b mb-1">HALLAZGOS:</h3>
                <p className="whitespace-pre-wrap text-sm">{consultation.ultrasoundReportFindings}</p>
            </div>
            
            <div>
                <h3 className="font-bold text-base border-b mb-1">IMPRESIÓN DIAGNÓSTICA:</h3>
                <p className="whitespace-pre-wrap text-sm">{consultation.ultrasoundReportImpression}</p>
            </div>
        </div>

        {consultation.ultrasoundImages && consultation.ultrasoundImages.length > 0 && (
            <section className="mt-4 pt-4 border-t">
                <h3 className="font-bold text-base text-center mb-2">IMÁGENES ADJUNTAS:</h3>
                <div className="grid grid-cols-2 gap-2">
                    {consultation.ultrasoundImages.map((imgSrc, index) => (
                        <div key={index} className="border p-1 break-inside-avoid">
                            <img src={imgSrc} alt={`Imagen de ultrasonido ${index + 1}`} className="w-full h-auto" />
                        </div>
                    ))}
                </div>
            </section>
        )}
      </main>

      <footer className="mt-12 pt-4 text-xs">
        <div className="text-center">
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
                 .break-inside-avoid {
                    page-break-inside: avoid;
                }
            }
        `}</style>
    </div>
  );
});

export default PrintableUltrasoundReport;