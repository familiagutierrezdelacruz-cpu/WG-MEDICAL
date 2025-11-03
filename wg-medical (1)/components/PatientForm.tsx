import React, { useState, useMemo } from 'react';
import { Patient } from '../types';
import { calculateAge } from '../utils/dateUtils';

interface PatientFormProps {
  patient?: Patient;
  // FIX: Changed the onSave prop type to correctly reflect that a new patient object
  // from the form does not include 'id' or 'doctorId'. This resolves the type error.
  onSave: (patient: Omit<Patient, 'id' | 'doctorId'> | Patient) => void;
  onCancel: () => void;
}

// FIX: Implemented the missing PatientForm component to allow creating and editing patient data.
const PatientForm: React.FC<PatientFormProps> = ({ patient, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: patient?.name || '',
    dob: patient?.dob || '',
    gender: patient?.gender || 'Masculino',
    contact: patient?.contact || '',
    allergies: patient?.allergies || '',
    familyHistory: patient?.familyHistory ?? (!patient ? 'PREGUNTADOS Y NEGADOS' : ''),
    pathologicalHistory: patient?.pathologicalHistory ?? (!patient ? 'PREGUNTADOS Y NEGADOS' : ''),
    nonPathologicalHistory: patient?.nonPathologicalHistory ?? (!patient ? 'PREGUNTADOS Y NEGADOS' : ''),
    surgicalHistory: patient?.surgicalHistory ?? (!patient ? 'PREGUNTADOS Y NEGADOS' : ''),
    gynecologicalHistory: patient?.gynecologicalHistory || '',
    lastPapanicolaou: patient?.lastPapanicolaou || '',
    lastColposcopy: patient?.lastColposcopy || '',
  });

  const age = useMemo(() => calculateAge(formData.dob), [formData.dob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Exclude select and date fields from uppercase transformation
    if (e.target.type === 'select-one' || e.target.type === 'date') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patient) {
      onSave({ ...patient, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1 max-h-[85vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800">{patient ? 'Editar Paciente' : 'Nuevo Paciente'}</h2>
      
      <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="text-lg font-semibold text-slate-700 px-2">Información Personal</legend>
        <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input-style" required />
        </div>
        <div>
            <label htmlFor="dob" className="block text-sm font-medium text-slate-700">Fecha de Nacimiento</label>
            <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} className="mt-1 block w-full input-style" required />
            {age !== null && (
              <p className="mt-1 text-sm text-slate-500">Edad calculada: {age}</p>
            )}
        </div>
        <div>
            <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Género</label>
            <select name="gender" id="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full input-style" required>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
            </select>
        </div>
        <div>
            <label htmlFor="contact" className="block text-sm font-medium text-slate-700">Contacto (Teléfono/Email)</label>
            <input type="text" name="contact" id="contact" value={formData.contact} onChange={handleChange} className="mt-1 block w-full input-style" required />
        </div>
      </fieldset>
      
       <fieldset className="space-y-4 border p-4 rounded-md">
        <legend className="text-lg font-semibold text-slate-700 px-2">Antecedentes Médicos</legend>
        <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-slate-700">Alergias</label>
            <textarea name="allergies" id="allergies" value={formData.allergies} onChange={handleChange} rows={2} className="mt-1 block w-full input-style" placeholder="Ej: Penicilina, AINEs..." />
        </div>
        <div>
            <label htmlFor="familyHistory" className="block text-sm font-medium text-slate-700">Antecedentes Familiares</label>
            <textarea name="familyHistory" id="familyHistory" value={formData.familyHistory} onChange={handleChange} rows={2} className="mt-1 block w-full input-style" />
        </div>
        <div>
            <label htmlFor="pathologicalHistory" className="block text-sm font-medium text-slate-700">Antecedentes Personales Patológicos</label>
            <textarea name="pathologicalHistory" id="pathologicalHistory" value={formData.pathologicalHistory} onChange={handleChange} rows={2} className="mt-1 block w-full input-style" />
        </div>
        <div>
            <label htmlFor="nonPathologicalHistory" className="block text-sm font-medium text-slate-700">Antecedentes Personales No Patológicos</label>
            <textarea name="nonPathologicalHistory" id="nonPathologicalHistory" value={formData.nonPathologicalHistory} onChange={handleChange} rows={2} className="mt-1 block w-full input-style" />
        </div>
        <div>
            <label htmlFor="surgicalHistory" className="block text-sm font-medium text-slate-700">Antecedentes Quirúrgicos</label>
            <textarea name="surgicalHistory" id="surgicalHistory" value={formData.surgicalHistory} onChange={handleChange} rows={2} className="mt-1 block w-full input-style" />
        </div>
       </fieldset>

      {formData.gender === 'Femenino' && (
        <fieldset className="space-y-4 border p-4 rounded-md bg-pink-50 border-pink-200">
          <legend className="text-lg font-semibold text-pink-800 px-2">Historial Ginecológico</legend>
          <div>
            <label htmlFor="gynecologicalHistory" className="block text-sm font-medium text-slate-700">Antecedentes Gineco-Obstétricos</label>
            <textarea name="gynecologicalHistory" id="gynecologicalHistory" value={formData.gynecologicalHistory} onChange={handleChange} rows={2} className="mt-1 block w-full input-style" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="lastPapanicolaou" className="block text-sm font-medium text-slate-700">Fecha de último Papanicolau</label>
                <input type="date" name="lastPapanicolaou" id="lastPapanicolaou" value={formData.lastPapanicolaou} onChange={handleChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label htmlFor="lastColposcopy" className="block text-sm font-medium text-slate-700">Fecha de última Colposcopia</label>
                <input type="date" name="lastColposcopy" id="lastColposcopy" value={formData.lastColposcopy} onChange={handleChange} className="mt-1 block w-full input-style" />
            </div>
          </div>
        </fieldset>
      )}

      <div className="flex justify-end space-x-2 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
      </div>
       {/* FIX: Corrected a truncated and unterminated style template literal, which was causing a parsing error. */}
       <style>{`.input-style { background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-style:focus { ring: 2px; ring-color: #3b82f6; border-color: #3b82f6;}`}</style>
    </form>
  );
};

// FIX: Added a default export to make the component importable in other files.
export default PatientForm;