import React, { useState, useMemo } from 'react';
import { Consultation, Patient } from '../types';
import { PrintIcon } from './icons/PrintIcon';
import NewWindow from './NewWindow';

interface AppointmentsReportModalProps {
    consultations: Consultation[];
    patients: Patient[];
    onClose: () => void;
}

const PrintableReport: React.FC<{ consultations: Consultation[], patientsMap: Map<string, string>, startDate: string, endDate: string, totalRevenue: number }> = ({ consultations, patientsMap, startDate, endDate, totalRevenue }) => (
    <div className="p-4 sm:p-6 bg-white text-black text-sm font-sans">
        <div className="text-center mb-4">
            <h2 className="text-xl font-bold">Reporte de Consultas Atendidas</h2>
            <p className="text-slate-600">
                Del {new Date(startDate + 'T00:00:00').toLocaleDateString('es-MX')} al {new Date(endDate + 'T00:00:00').toLocaleDateString('es-MX')}
            </p>
        </div>
        <div className="flex justify-between font-bold text-slate-700 mb-2">
            <span>Total de consultas: {consultations.length}</span>
            <span>Ingreso Total: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalRevenue)}</span>
        </div>
        <table className="w-full text-sm text-left text-slate-600 border-collapse">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                <tr>
                    <th scope="col" className="px-4 py-3 border">Fecha</th>
                    <th scope="col" className="px-4 py-3 border">Paciente</th>
                    <th scope="col" className="px-4 py-3 border">Motivo de Consulta</th>
                    <th scope="col" className="px-4 py-3 border">Costo</th>
                </tr>
            </thead>
            <tbody>
                {consultations.map(c => (
                    <tr key={c.id} className="bg-white border-b">
                        <td className="px-4 py-2 border">{new Date(c.date).toLocaleDateString('es-MX')}</td>
                        <td className="px-4 py-2 font-medium text-slate-900 border">{patientsMap.get(c.patientId) || 'Paciente no encontrado'}</td>
                        <td className="px-4 py-2 border">{c.reason}</td>
                        <td className="px-4 py-2 border font-semibold text-green-700">{c.cost ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(c.cost) : 'N/A'}</td>
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

const AppointmentsReportModal: React.FC<AppointmentsReportModalProps> = ({ consultations, patients, onClose }) => {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(today);
    const [isPrinting, setIsPrinting] = useState(false);
    
    const patientsMap = useMemo(() => new Map(patients.map(p => [p.id, p.name])), [patients]);

    const filteredConsultations = useMemo(() => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');

        return consultations
            .filter(c => {
                const consultDate = new Date(c.date);
                return consultDate >= start && consultDate <= end;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [consultations, startDate, endDate]);

    const totalRevenue = useMemo(() => {
        return filteredConsultations.reduce((sum, c) => sum + (c.cost || 0), 0);
    }, [filteredConsultations]);
    
    return (
         <div className="p-1 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Reporte de Consultas Atendidas</h2>
                <button onClick={() => setIsPrinting(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PrintIcon className="w-4 h-4" />
                    <span>Imprimir</span>
                </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Desde</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full input-style" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">Hasta</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full input-style" />
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto border rounded-md p-4 bg-slate-50">
                <div className="flex justify-between font-bold text-slate-700 mb-2">
                    <span>Total de consultas: {filteredConsultations.length}</span>
                    <span>Ingreso Total: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalRevenue)}</span>
                </div>
                {filteredConsultations.length > 0 ? (
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-4 py-3">Fecha</th>
                                <th scope="col" className="px-4 py-3">Paciente</th>
                                <th scope="col" className="px-4 py-3">Motivo</th>
                                <th scope="col" className="px-4 py-3">Costo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredConsultations.map(c => (
                                <tr key={c.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-4 py-2">{new Date(c.date).toLocaleDateString('es-MX')}</td>
                                    <td className="px-4 py-2 font-medium text-slate-900">{patientsMap.get(c.patientId) || 'Paciente no encontrado'}</td>
                                    <td className="px-4 py-2">{c.reason}</td>
                                    <td className="px-4 py-2 font-semibold text-green-700">{c.cost ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(c.cost) : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-slate-500 py-8">No hay consultas en el rango de fechas seleccionado.</p>
                )}
            </div>

            <div className="flex justify-end pt-6 mt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cerrar</button>
            </div>
             <style>{`.input-style { background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }`}</style>
            
            {isPrinting && (
                <NewWindow onClose={() => setIsPrinting(false)} title="Reporte de Consultas">
                    <PrintableReport 
                        consultations={filteredConsultations}
                        patientsMap={patientsMap}
                        startDate={startDate}
                        endDate={endDate}
                        totalRevenue={totalRevenue}
                    />
                </NewWindow>
            )}
        </div>
    );
};

export default AppointmentsReportModal;