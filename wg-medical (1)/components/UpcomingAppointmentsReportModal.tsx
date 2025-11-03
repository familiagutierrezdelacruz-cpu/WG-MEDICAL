
import React, { useMemo, useState } from 'react';
import { Consultation, Patient } from '../types';
import { PrintIcon } from './icons/PrintIcon';
import { parseLocalDate } from '../utils/dateUtils';
import NewWindow from './NewWindow';

interface UpcomingAppointmentsReportModalProps {
    consultations: Consultation[];
    patients: Patient[];
    onClose: () => void;
}

interface PrintableUpcomingReportProps {
    appointments: Consultation[];
    patientsMap: Map<string, { name: string, contact: string }>;
    startDate: string;
    endDate: string;
}

const PrintableUpcomingReport: React.FC<PrintableUpcomingReportProps> = ({ appointments, patientsMap, startDate, endDate }) => (
    <div className="p-4 sm:p-6 bg-white text-black text-sm font-sans">
        <div className="text-center mb-4">
            <h2 className="text-xl font-bold">Reporte de Próximas Citas</h2>
             <p className="text-slate-600">
                Del {parseLocalDate(startDate).toLocaleDateString('es-MX')} al {parseLocalDate(endDate).toLocaleDateString('es-MX')}
            </p>
        </div>
        <table className="w-full text-sm text-left text-slate-600 border-collapse">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th scope="col" className="px-4 py-3 border">Fecha de Cita</th>
                    <th scope="col" className="px-4 py-3 border">Paciente</th>
                    <th scope="col" className="px-4 py-3 border">Contacto</th>
                    <th scope="col" className="px-4 py-3 border">Motivo Última Consulta</th>
                </tr>
            </thead>
            <tbody>
                {appointments.map(c => (
                    <tr key={c.id} className="bg-white border-b">
                        <td className="px-4 py-2 font-bold text-slate-900 border">{parseLocalDate(c.nextAppointment!).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        <td className="px-4 py-2 font-medium text-slate-900 border">{patientsMap.get(c.patientId)?.name || 'Paciente no encontrado'}</td>
                        <td className="px-4 py-2 border">{patientsMap.get(c.patientId)?.contact || 'N/A'}</td>
                        <td className="px-4 py-2 border">{c.reason}</td>
                    </tr>
                ))}
            </tbody>
        </table>
         <style>{`
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        `}</style>
    </div>
);


const UpcomingAppointmentsReportModal: React.FC<UpcomingAppointmentsReportModalProps> = ({ consultations, patients, onClose }) => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(nextMonth.toISOString().split('T')[0]);
    const [isPrinting, setIsPrinting] = useState(false);

    const patientsMap = useMemo(() => new Map(patients.map(p => [p.id, { name: p.name, contact: p.contact }])), [patients]);

    const upcomingAppointments = useMemo(() => {
        const start = parseLocalDate(startDate);
        const end = parseLocalDate(endDate);
        end.setHours(23, 59, 59, 999);

        return consultations
            .filter(c => {
                if (!c.nextAppointment) return false;
                const appointmentDate = parseLocalDate(c.nextAppointment);
                return appointmentDate >= start && appointmentDate <= end;
            })
            .sort((a, b) => parseLocalDate(a.nextAppointment!).getTime() - parseLocalDate(b.nextAppointment!).getTime());
    }, [consultations, startDate, endDate]);
    
    return (
        <div className="p-1 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Próximas Citas</h2>
                <button onClick={() => setIsPrinting(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PrintIcon className="w-4 h-4" />
                    <span>Imprimir</span>
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div>
                    <label htmlFor="startDateUpcoming" className="block text-sm font-medium text-slate-700">Desde</label>
                    <input type="date" id="startDateUpcoming" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full input-style" />
                </div>
                <div>
                    <label htmlFor="endDateUpcoming" className="block text-sm font-medium text-slate-700">Hasta</label>
                    <input type="date" id="endDateUpcoming" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full input-style" />
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto border rounded-md p-4 bg-slate-50">
                {upcomingAppointments.length > 0 ? (
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-4 py-3">Fecha de Cita</th>
                                <th scope="col" className="px-4 py-3">Paciente</th>
                                <th scope="col" className="px-4 py-3">Contacto</th>
                                <th scope="col" className="px-4 py-3">Motivo Última Consulta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingAppointments.map(c => (
                                <tr key={c.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-4 py-2 font-bold text-slate-900">{parseLocalDate(c.nextAppointment!).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    <td className="px-4 py-2 font-medium text-slate-900">{patientsMap.get(c.patientId)?.name || 'Paciente no encontrado'}</td>
                                    <td className="px-4 py-2">{patientsMap.get(c.patientId)?.contact || 'N/A'}</td>
                                    <td className="px-4 py-2">{c.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-slate-500 py-8">No hay próximas citas programadas en el rango de fechas seleccionado.</p>
                )}
            </div>

            <div className="flex justify-end pt-6 mt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cerrar</button>
            </div>
            
            {isPrinting && (
                <NewWindow onClose={() => setIsPrinting(false)} title="Reporte de Próximas Citas">
                    <PrintableUpcomingReport 
                        appointments={upcomingAppointments}
                        patientsMap={patientsMap}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </NewWindow>
            )}
            <style>{`.input-style { background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }`}</style>
        </div>
    );
};

export default UpcomingAppointmentsReportModal;
