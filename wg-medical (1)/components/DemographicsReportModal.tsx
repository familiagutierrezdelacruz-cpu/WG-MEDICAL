import React, { useMemo, useState } from 'react';
import { Patient } from '../types';
import { getAgeInYears } from '../utils/dateUtils';
import { PrintIcon } from './icons/PrintIcon';
import NewWindow from './NewWindow';

interface DemographicsReportModalProps {
    patients: Patient[];
    onClose: () => void;
}

const AGE_GROUPS = {
    '<5': 'Menores de 5 años',
    '5-10': '5 a 10 años',
    '10-18': '10 a 18 años',
    '18-37': '18 a 37 años',
    '37-60': '37 a 60 años',
    '>60': 'Mayores de 60 años',
};

type AgeGroupKeys = keyof typeof AGE_GROUPS;

const getAgeGroup = (age: number): AgeGroupKeys => {
    if (age < 5) return '<5';
    if (age <= 10) return '5-10';
    if (age <= 18) return '10-18';
    if (age <= 37) return '18-37';
    if (age <= 60) return '37-60';
    return '>60';
};

interface ReportData {
    [key: string]: { 'Masculino': number; 'Femenino': number; 'Otro': number; };
}

const ReportChart: React.FC<{ data: ReportData, totalPatients: number }> = ({ data, totalPatients }) => {
    return (
         <div className="space-y-4">
            {Object.entries(AGE_GROUPS).map(([key, label]) => {
                const groupData = data[key as AgeGroupKeys];
                const totalInGroup = groupData.Masculino + groupData.Femenino + groupData.Otro;
                const maxInGroup = Math.max(groupData.Masculino, groupData.Femenino, groupData.Otro);

                return (
                    <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold text-slate-700">{label}</h4>
                            <span className="text-sm font-bold text-slate-500">{totalInGroup} paciente(s)</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-24 text-sm text-slate-600">Masculino:</span>
                                <div className="w-full bg-slate-200 rounded-full h-5">
                                    <div className="bg-blue-500 h-5 rounded-full flex items-center justify-end px-2" style={{ width: totalInGroup > 0 ? `${(groupData.Masculino / totalInGroup) * 100}%` : '0%' }}>
                                        <span className="text-xs font-bold text-white">{groupData.Masculino > 0 ? groupData.Masculino : ''}</span>
                                    </div>
                                </div>
                            </div>
                             <div className="flex items-center gap-2">
                                <span className="w-24 text-sm text-slate-600">Femenino:</span>
                                <div className="w-full bg-slate-200 rounded-full h-5">
                                    <div className="bg-pink-500 h-5 rounded-full flex items-center justify-end px-2" style={{ width: totalInGroup > 0 ? `${(groupData.Femenino / totalInGroup) * 100}%` : '0%' }}>
                                         <span className="text-xs font-bold text-white">{groupData.Femenino > 0 ? groupData.Femenino : ''}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};


const DemographicsReportModal: React.FC<DemographicsReportModalProps> = ({ patients, onClose }) => {
    const [isPrinting, setIsPrinting] = useState(false);

    const reportData = useMemo(() => {
        const data: ReportData = Object.keys(AGE_GROUPS).reduce((acc, key) => {
            acc[key] = { 'Masculino': 0, 'Femenino': 0, 'Otro': 0 };
            return acc;
        }, {} as ReportData);

        patients.forEach(patient => {
            const age = getAgeInYears(patient.dob);
            const ageGroupKey = getAgeGroup(age);
            if (data[ageGroupKey] && patient.gender !== 'Otro') {
                 data[ageGroupKey][patient.gender]++;
            }
        });
        return data;
    }, [patients]);
    
    const totalPatients = patients.length;

    return (
        <div className="p-1 max-h-[85vh] flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Reporte Demográfico de Pacientes</h2>
                <button onClick={() => setIsPrinting(true)} className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PrintIcon className="w-4 h-4" />
                    <span>Imprimir</span>
                </button>
            </div>

            <div className="flex-grow overflow-y-auto border rounded-md p-4 bg-slate-50">
                <div className="flex justify-between font-bold text-slate-700 mb-4 border-b pb-2">
                    <span>Total de Pacientes: {totalPatients}</span>
                </div>
                <ReportChart data={reportData} totalPatients={totalPatients} />
            </div>

            <div className="flex justify-end pt-6 mt-4 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cerrar</button>
            </div>
            
            {isPrinting && (
                 <NewWindow onClose={() => setIsPrinting(false)} title="Reporte Demográfico">
                    <div className="p-6 font-sans">
                         <div className="text-center mb-6">
                            <h2 className="text-xl font-bold">Reporte Demográfico de Pacientes</h2>
                         </div>
                         <div className="flex justify-between font-bold text-slate-700 mb-4 border-b pb-2">
                            <span>Total de Pacientes: {totalPatients}</span>
                        </div>
                        <ReportChart data={reportData} totalPatients={totalPatients} />
                         <style>{`
                            @media print {
                                body {
                                    -webkit-print-color-adjust: exact;
                                    print-color-adjust: exact;
                                }
                            }
                        `}</style>
                    </div>
                </NewWindow>
            )}
        </div>
    );
};

export default DemographicsReportModal;