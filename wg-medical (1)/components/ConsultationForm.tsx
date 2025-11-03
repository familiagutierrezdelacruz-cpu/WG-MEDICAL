
// FIX: Implemented the missing ConsultationForm component.
import React, { useState, useMemo, useEffect } from 'react';
import { Consultation, Medication, Patient, VitalSigns, Doctor } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { PlusIcon } from './icons/PlusIcon';
import { generatePatientExplanation } from '../services/geminiService';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import Modal from './Modal';


interface ConsultationFormProps {
  patient: Patient;
  doctor: Doctor;
  consultation?: Consultation;
  medications: string[];
  onSave: (consultation: Omit<Consultation, 'id'> | Consultation) => void;
  onCancel: () => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ patient, doctor, consultation, medications, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    date: consultation?.date || new Date().toISOString(),
    reason: consultation?.reason || '',
    physicalExam: consultation?.physicalExam || '',
    diagnosis: consultation?.diagnosis || '',
    labStudies: consultation?.labStudies || '',
    nextAppointment: consultation?.nextAppointment || '',
    cost: consultation?.cost || undefined,
    ultrasoundReportType: consultation?.ultrasoundReportType || '',
    ultrasoundReportFindings: consultation?.ultrasoundReportFindings || '',
    ultrasoundReportImpression: consultation?.ultrasoundReportImpression || '',
    ultrasoundImages: consultation?.ultrasoundImages || [],
  });

  const [vitalSigns, setVitalSigns] = useState<VitalSigns>(consultation?.vitalSigns || {});
  const [prescriptionMeds, setPrescriptionMeds] = useState<Medication[]>(consultation?.prescription.medications || []);
  const [instructions, setInstructions] = useState(consultation?.prescription.instructions || '');
  const [explanation, setExplanation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [isUltrasoundModalOpen, setIsUltrasoundModalOpen] = useState(false);

  const bmi = useMemo(() => {
    const weight = Number(vitalSigns.weight);
    const height = Number(vitalSigns.height);
    if (weight > 0 && height > 0) {
      const bmiValue = weight / (height * height);
      let interpretation = 'Desconocido';
      if (bmiValue < 18.5) interpretation = 'Bajo peso';
      else if (bmiValue < 25) interpretation = 'Normal';
      else if (bmiValue < 30) interpretation = 'Sobrepeso';
      else interpretation = 'Obesidad';
      return { value: bmiValue.toFixed(2), interpretation };
    }
    return { value: '', interpretation: '' };
  }, [vitalSigns.weight, vitalSigns.height]);

  useEffect(() => {
    if (bmi.value) {
      setVitalSigns(prev => ({ ...prev, bmi: bmi.value, bmiInterpretation: bmi.interpretation }));
    }
  }, [bmi]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'cost') {
        setFormData(prev => ({ ...prev, cost: value === '' ? undefined : Number(value) }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    }
  };
  
  const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVitalSigns(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
  };

  const handleMedChange = (index: number, field: keyof Medication, value: string) => {
    const newMeds = [...prescriptionMeds];
    newMeds[index] = { ...newMeds[index], [field]: value.toUpperCase() };
    setPrescriptionMeds(newMeds);
  };

  const addMedication = () => {
    setPrescriptionMeds([...prescriptionMeds, { name: '', indication: '', route: 'ORAL' }]);
  };

  const removeMedication = (index: number) => {
    setPrescriptionMeds(prescriptionMeds.filter((_, i) => i !== index));
  };

  const handleGenerateExplanation = async () => {
    if (!formData.diagnosis) return;
    setIsGenerating(true);
    const result = await generatePatientExplanation(formData.diagnosis);
    setExplanation(result);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalConsultationData = {
      ...formData,
      patientId: patient.id,
      doctorId: doctor.id,
      vitalSigns,
      prescription: {
        medications: prescriptionMeds.filter(m => m.name.trim() !== ''),
        instructions,
      },
    };
    
    if (consultation) {
      onSave({ ...consultation, ...finalConsultationData });
    } else {
      onSave(finalConsultationData);
    }
  };
  
  const UltrasoundForm = () => {
      // Local state for the ultrasound text fields to prevent re-rendering the main form
      const [localUsgText, setLocalUsgText] = useState({
        ultrasoundReportType: formData.ultrasoundReportType || '',
        ultrasoundReportFindings: formData.ultrasoundReportFindings || '',
        ultrasoundReportImpression: formData.ultrasoundReportImpression || '',
      });

      // Handler for local state changes
      const handleUsTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalUsgText(prev => ({ ...prev, [name]: value.toUpperCase() }));
      };

      const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const imagePromises = files.map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(imagePromises).then(base64Images => {
                setFormData(prev => ({
                    ...prev,
                    ultrasoundImages: [...(prev.ultrasoundImages || []), ...base64Images]
                }));
            });
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            ultrasoundImages: (prev.ultrasoundImages || []).filter((_, index) => index !== indexToRemove)
        }));
    };
    
    // Function to save the local text changes back to the main form state and close
    const handleSaveAndClose = () => {
        setFormData(prev => ({
            ...prev,
            ...localUsgText
        }));
        setIsUltrasoundModalOpen(false);
    };

    // The cancel button just closes the modal, discarding local text changes
    const handleCancel = () => {
        setIsUltrasoundModalOpen(false);
    }

      return (
         <div className="space-y-4">
            <h3 className="text-xl font-bold">Reporte de Ultrasonido</h3>
            <div>
                <label className="text-sm font-medium text-slate-700">Tipo de Reporte</label>
                <input name="ultrasoundReportType" value={localUsgText.ultrasoundReportType} onChange={handleUsTextChange} className="mt-1 block w-full input-style"/>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">Hallazgos</label>
                <textarea name="ultrasoundReportFindings" value={localUsgText.ultrasoundReportFindings} onChange={handleUsTextChange} rows={5} className="mt-1 block w-full input-style"/>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-700">Impresión Diagnóstica</label>
                <textarea name="ultrasoundReportImpression" value={localUsgText.ultrasoundReportImpression} onChange={handleUsTextChange} rows={3} className="mt-1 block w-full input-style"/>
            </div>
             <div>
                <label className="text-sm font-medium text-slate-700">Imágenes (Opcional)</label>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <div className="mt-2 grid grid-cols-3 gap-2">
                    {(formData.ultrasoundImages || []).map((img, index) => (
                        <div key={index} className="relative group">
                            <img src={img} alt={`Preview ${index}`} className="w-full h-auto rounded-md object-cover" />
                            <button 
                                type="button" 
                                onClick={() => removeImage(index)} 
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
                 <button type="button" onClick={handleCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
                 <button type="button" onClick={handleSaveAndClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar y Cerrar</button>
            </div>
        </div>
      )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1 max-h-[85vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800">{consultation ? 'Editar Consulta' : 'Nueva Consulta'}</h2>
      
      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="text-lg font-semibold text-slate-700 px-2">Motivo y Examen</legend>
        <div>
            <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Motivo de la Consulta</label>
            <textarea name="reason" id="reason" value={formData.reason} onChange={handleChange} rows={2} className="mt-1 block w-full input-style" required />
        </div>
        <div>
            <label htmlFor="physicalExam" className="block text-sm font-medium text-slate-700">Exploración Física</label>
            <textarea name="physicalExam" id="physicalExam" value={formData.physicalExam} onChange={handleChange} rows={4} className="mt-1 block w-full input-style" />
        </div>
      </fieldset>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="text-lg font-semibold text-slate-700 px-2">Signos Vitales</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div>
                <label className="block text-xs font-medium text-slate-600">T.A. Sistólica (mmHg)</label>
                <input type="number" name="systolicBP" value={vitalSigns.systolicBP || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">T.A. Diastólica (mmHg)</label>
                <input type="number" name="diastolicBP" value={vitalSigns.diastolicBP || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">F.C. (lpm)</label>
                <input type="number" name="heartRate" value={vitalSigns.heartRate || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">F.R. (rpm)</label>
                <input type="number" name="respiratoryRate" value={vitalSigns.respiratoryRate || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">Temp (°C)</label>
                <input type="number" step="0.1" name="temperature" value={vitalSigns.temperature || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">Sat O₂ (%)</label>
                <input type="number" name="oxygenSaturation" value={vitalSigns.oxygenSaturation || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
             <div>
                <label className="block text-xs font-medium text-slate-600">Glucosa (mg/dL)</label>
                <input type="number" name="glucose" value={vitalSigns.glucose || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">Peso (kg)</label>
                <input type="number" step="0.1" name="weight" value={vitalSigns.weight || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label className="block text-xs font-medium text-slate-600">Talla (m)</label>
                <input type="number" step="0.01" name="height" value={vitalSigns.height || ''} onChange={handleVitalsChange} className="mt-1 block w-full input-style" />
            </div>
            {bmi.value && (
                <div className="p-2 bg-slate-100 rounded-md text-center col-span-2 sm:col-span-1">
                    <p className="text-xs font-medium text-slate-600">IMC</p>
                    <p className="font-bold text-slate-800">{bmi.value}</p>
                    <p className="text-xs text-slate-500">{bmi.interpretation}</p>
                </div>
            )}
        </div>
      </fieldset>

      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="text-lg font-semibold text-slate-700 px-2">Diagnóstico y Plan</legend>
        <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700">Diagnóstico</label>
            <textarea name="diagnosis" id="diagnosis" value={formData.diagnosis} onChange={handleChange} rows={3} className="mt-1 block w-full input-style" required />
             <div className="mt-2">
                <button type="button" onClick={handleGenerateExplanation} disabled={isGenerating || !formData.diagnosis} className="flex items-center gap-2 text-sm text-blue-600 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed">
                    <SparklesIcon className="w-4 h-4" />
                    <span>{isGenerating ? 'Generando...' : 'Generar explicación para paciente'}</span>
                </button>
                {explanation && <p className="mt-2 p-3 bg-blue-50 border border-blue-200 text-slate-700 rounded-md text-sm">{explanation}</p>}
            </div>
        </div>
         <div>
            <label htmlFor="labStudies" className="block text-sm font-medium text-slate-700">Estudios de Laboratorio/Gabinete</label>
            <textarea name="labStudies" id="labStudies" value={formData.labStudies} onChange={handleChange} rows={3} className="mt-1 block w-full input-style" />
        </div>
      </fieldset>

       <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="text-lg font-semibold text-slate-700 px-2">Receta Médica</legend>
        {prescriptionMeds.map((med, index) => (
          <div key={index} className="p-3 border rounded-md space-y-3 relative bg-white">
            <button type="button" onClick={() => removeMedication(index)} className="absolute top-1 right-2 text-red-500 hover:text-red-700 text-2xl font-bold">&times;</button>
            <div>
              <label className="block text-xs font-medium text-slate-600">Medicamento</label>
              <input type="text" list="medications-list" value={med.name} onChange={e => handleMedChange(index, 'name', e.target.value)} className="mt-1 block w-full input-style" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Dosis / Indicación</label>
              <textarea value={med.indication} onChange={e => handleMedChange(index, 'indication', e.target.value)} rows={2} className="mt-1 block w-full input-style" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Vía de Administración</label>
              <select value={med.route} onChange={e => handleMedChange(index, 'route', e.target.value)} className="mt-1 block w-full input-style">
                  <option>ORAL</option>
                  <option>INTRAMUSCULAR</option>
                  <option>INTRAVENOSA</option>
                  <option>TÓPICA</option>
                  <option>SUBLINGUAL</option>
                  <option>OFTÁLMICA</option>
                  <option>ÓTICA</option>
                  <option>NASAL</option>
                  <option>VAGINAL</option>
                  <option>RECTAL</option>
              </select>
            </div>
          </div>
        ))}
        <datalist id="medications-list">
            {medications.map(m => <option key={m} value={m} />)}
        </datalist>
        <button type="button" onClick={addMedication} className="flex items-center gap-2 text-sm font-semibold text-blue-600"><PlusIcon className="w-4 h-4"/>Añadir Medicamento</button>
        <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-slate-700">Indicaciones Generales</label>
            <textarea name="instructions" id="instructions" value={instructions} onChange={e => setInstructions(e.target.value.toUpperCase())} rows={3} className="mt-1 block w-full input-style" />
        </div>
      </fieldset>
      
       <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="text-lg font-semibold text-slate-700 px-2">Seguimiento y Costos</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="nextAppointment" className="block text-sm font-medium text-slate-700">Próxima Cita (Opcional)</label>
                <input type="date" name="nextAppointment" id="nextAppointment" value={formData.nextAppointment} onChange={handleChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label htmlFor="cost" className="block text-sm font-medium text-slate-700">Costo de Consulta (MXN)</label>
                <input type="number" step="0.01" name="cost" id="cost" value={formData.cost || ''} onChange={handleChange} className="mt-1 block w-full input-style" placeholder="Ej: 500.00"/>
            </div>
        </div>
        <div>
            <button type="button" onClick={() => setIsUltrasoundModalOpen(true)} className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                <DocumentTextIcon className="w-4 h-4" />
                <span>{formData.ultrasoundReportType ? 'Editar' : 'Añadir'} Reporte de Ultrasonido</span>
            </button>
        </div>
      </fieldset>

      <div className="flex justify-end space-x-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar Consulta</button>
      </div>
      
      <Modal isOpen={isUltrasoundModalOpen} onClose={() => setIsUltrasoundModalOpen(false)}>
        <UltrasoundForm />
      </Modal>

      <style>{`.input-style { background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-style:focus { ring: 2px; ring-color: #3b82f6; border-color: #3b82f6;}`}</style>
    </form>
  );
};

export default ConsultationForm;
