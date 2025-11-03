import React, { useState } from 'react';
import { AppSettings, ClinicInfo } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

type CheckStatus = 'idle' | 'checking' | 'success' | 'error';

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [medicationsUrl, setMedicationsUrl] = useState(settings.medicationsUrl || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQRPzitaMaWM2t6yoGRktvc5ZukbSRoNe7yl1VAHWY7y_LLuFA4rXnbSobIKXVsQeWA-lKRMOBoFjiN/pub?gid=0&single=true&output=tsv');
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(settings.clinicInfo || {
      name: '', address: '', phone: '', slogan: '', logo: ''
  });
  const [checkStatus, setCheckStatus] = useState<CheckStatus>('idle');
  const [checkMessage, setCheckMessage] = useState('');

  const handleClinicInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setClinicInfo(prev => ({ ...prev, [name]: value.toUpperCase() }));
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setClinicInfo(prev => ({...prev, logo: reader.result as string}))
        }
        reader.readAsDataURL(file);
    }
  }

  const handleCheckConnection = async () => {
    if (!medicationsUrl) {
        setCheckStatus('error');
        setCheckMessage('Por favor, ingrese una URL.');
        return;
    }
    setCheckStatus('checking');
    setCheckMessage('');
    try {
        const cacheBustingUrl = `${medicationsUrl}&_=${new Date().getTime()}`;
        const response = await fetch(cacheBustingUrl);
        if (!response.ok) {
            throw new Error(`Error de red: ${response.statusText}`);
        }
        const csvText = await response.text();
        const medications = csvText.split('\n').map(line => line.trim()).filter(Boolean);
        setCheckStatus('success');
        setCheckMessage(`Conexión exitosa. Se encontraron ${medications.length} medicamentos.`);

    } catch (error: any) {
        setCheckStatus('error');
        setCheckMessage(`Error al conectar: ${error.message}. Verifique la URL y los permisos.`);
    }
  }

  const handleSave = () => {
    onSave({ medicationsUrl, clinicInfo });
  };
  
  const statusIndicator = {
    checking: <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
    success: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    error: <XCircleIcon className="h-5 w-5 text-red-500" />,
  };

  return (
    <div className="p-1 max-h-[85vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Configuración</h2>
      
      <div className="space-y-6">
        <fieldset className="space-y-4 border p-4 rounded-md">
            <legend className="text-lg font-semibold text-slate-700 px-2">Información de la Clínica</legend>
            <div>
                <label htmlFor="clinicName" className="block text-sm font-medium text-slate-700">Nombre de la Clínica</label>
                <input type="text" name="name" id="clinicName" value={clinicInfo.name} onChange={handleClinicInfoChange} className="mt-1 block w-full input-style" />
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700">Dirección</label>
                <input type="text" name="address" id="address" value={clinicInfo.address} onChange={handleClinicInfoChange} className="mt-1 block w-full input-style" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Teléfono</label>
                    <input type="tel" name="phone" id="phone" value={clinicInfo.phone} onChange={handleClinicInfoChange} className="mt-1 block w-full input-style" />
                </div>
                 <div>
                    <label htmlFor="slogan" className="block text-sm font-medium text-slate-700">Slogan (Opcional)</label>
                    <input type="text" name="slogan" id="slogan" value={clinicInfo.slogan} onChange={handleClinicInfoChange} className="mt-1 block w-full input-style" />
                </div>
            </div>
            <div>
                <label htmlFor="logo" className="block text-sm font-medium text-slate-700">Logo de la Clínica</label>
                <input type="file" name="logo" id="logo" onChange={handleLogoChange} accept="image/*" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                {clinicInfo.logo && <img src={clinicInfo.logo} alt="Vista previa del logo" className="mt-2 h-16 w-auto border rounded-md" />}
            </div>
        </fieldset>

        <fieldset className="space-y-4 border p-4 rounded-md">
            <legend className="text-lg font-semibold text-slate-700 px-2">Vademécum</legend>
            <div>
                <label htmlFor="medicationsUrl" className="block text-sm font-medium text-slate-700">URL de la lista de medicamentos</label>
                 <div className="flex items-center gap-2 mt-1">
                    <input 
                        type="url" 
                        name="medicationsUrl" 
                        id="medicationsUrl"
                        value={medicationsUrl}
                        onChange={(e) => {
                            setMedicationsUrl(e.target.value);
                            setCheckStatus('idle');
                            setCheckMessage('');
                        }}
                        className="block w-full input-style"
                        placeholder="URL pública de Google Sheet (CSV)"
                    />
                    <button type="button" onClick={handleCheckConnection} disabled={checkStatus === 'checking'} className="px-3 py-2 text-sm bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-wait shrink-0">
                        {checkStatus === 'checking' ? 'Comprobando...' : 'Comprobar'}
                    </button>
                </div>
                 {checkStatus !== 'idle' && (
                    <div className={`flex items-center gap-2 mt-2 text-sm ${checkStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {statusIndicator[checkStatus]}
                        <span>{checkMessage}</span>
                    </div>
                )}
                <p className="mt-2 text-xs text-slate-500">
                    Pegue aquí el enlace a su hoja de cálculo de Google publicada como CSV. Debe contener una sola columna con los nombres de los medicamentos.
                </p>
            </div>
        </fieldset>
      </div>
      
      <div className="flex justify-end space-x-2 pt-6 mt-4 border-t">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancelar</button>
        <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar Cambios</button>
      </div>

       <style>{`.input-style { background-color: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none;} .input-style:focus { ring: 2px; ring-color: #3b82f6; border-color: #3b82f6;}`}</style>
    </div>
  );
};

export default SettingsModal;