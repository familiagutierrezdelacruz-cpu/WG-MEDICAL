import React, { useState } from 'react';
import { Doctor } from '../types';

interface DoctorFormProps {
  doctor?: Doctor;
  onSave: (doctor: Omit<Doctor, 'id'> | Doctor) => void;
  onCancel: () => void;
}

const DoctorForm: React.FC<DoctorFormProps> = ({ doctor, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: doctor?.name || '',
    professionalLicense: doctor?.professionalLicense || '',
    university: doctor?.university || '',
    diplomados: doctor?.diplomados || '',
    hasSpecialty: doctor?.hasSpecialty || false,
    specialtyName: doctor?.specialtyName || '',
    specialtyLicense: doctor?.specialtyLicense || '',
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!doctor && !password) {
      setError('La contraseña es obligatoria para nuevos médicos.');
      return;
    }
    
    const finalDoctorData: any = { ...formData };
    if (password) {
      finalDoctorData.password = password;
    }

    if (doctor) {
      onSave({ ...doctor, ...finalDoctorData });
    } else {
      onSave(finalDoctorData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold text-slate-800">{doctor ? 'Editar Médico' : 'Nuevo Médico'}</h3>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full input-style" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="professionalLicense" className="block text-sm font-medium text-slate-700">Cédula Profesional</label>
          <input type="text" name="professionalLicense" id="professionalLicense" value={formData.professionalLicense} onChange={handleChange} className="mt-1 block w-full input-style" required />
        </div>
        <div>
          <label htmlFor="university" className="block text-sm font-medium text-slate-700">Universidad</label>
          <input type="text" name="university" id="university" value={formData.university} onChange={handleChange} className="mt-1 block w-full input-style" required />
        </div>
      </div>
       <div>
        <label htmlFor="diplomados" className="block text-sm font-medium text-slate-700">Diplomados</label>
        <input type="text" name="diplomados" id="diplomados" value={formData.diplomados} onChange={handleChange} className="mt-1 block w-full input-style" />
      </div>

       <fieldset className="border p-4 rounded-md space-y-4">
        <legend className="text-sm font-semibold text-slate-700 px-2">Seguridad</legend>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
              <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full input-style" placeholder={doctor ? 'Dejar en blanco para no cambiar' : ''} required={!doctor} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirmar Contraseña</label>
              <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full input-style" required={!doctor || !!password} />
            </div>
        </div>
         {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </fieldset>

      <div className="flex items-center gap-2">
        <input type="checkbox" name="hasSpecialty" id="hasSpecialty" checked={formData.hasSpecialty} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <label htmlFor="hasSpecialty" className="text-sm font-medium text-slate-700">¿Tiene especialidad?</label>
      </div>
      
      {formData.hasSpecialty && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-md bg-slate-50">
          <div>
            <label htmlFor="specialtyName" className="block text-sm font-medium text-slate-700">Nombre de la Especialidad</label>
            <input type="text" name="specialtyName" id="specialtyName" value={formData.specialtyName} onChange={handleChange} className="mt-1 block w-full input-style" required={formData.hasSpecialty} />
          </div>
          <div>
            <label htmlFor="specialtyLicense" className="block text-sm font-medium text-slate-700">Cédula de Especialidad</label>
            <input type="text" name="specialtyLicense" id="specialtyLicense" value={formData.specialtyLicense} onChange={handleChange} className="mt-1 block w-full input-style" required={formData.hasSpecialty} />
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
      </div>
      <style>{`.input-style { background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-style:focus { ring: 2px; ring-color: #3b82f6; border-color: #3b82f6;}`}</style>
    </form>
  );
};

export default DoctorForm;