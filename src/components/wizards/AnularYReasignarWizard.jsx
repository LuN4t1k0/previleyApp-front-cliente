// "use client";

// import React, { useState, useEffect } from 'react';
// import useActionFeedback from '@/hooks/useActionFeedback';
// import apiService from '@/app/api/apiService';
// import GenericForm from '../forms/GenericForm'; // Asegúrate que la ruta a tu GenericForm sea correcta
// import { conciliacionFormConfig } from '@/config/forms/conciliacion.form.config'; // Reutilizamos la config del formulario
// import * as Yup from "yup";
// import { unformatPeriodo } from '@/utils/dateUtils';


// // --- Sub-componente: Paso 1 (Pedir el motivo) ---
// const Paso1_Motivo = ({ wizardData, setWizardData, setStep, onClose }) => {
//     const [motivo, setMotivo] = useState(wizardData.motivo || '');
//     const [error, setError] = useState('');

//     const handleNext = () => {
//         if (motivo.trim().length < 10) {
//             setError('El motivo debe tener al menos 10 caracteres.');
//             return;
//         }
//         setWizardData(prev => ({ ...prev, motivo }));
//         setStep(2);
//     };

//     return (
//         <div>
//             <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">Paso 1: Motivo de la Anulación</h3>
//             <p className="mt-2 text-tremor-default text-tremor-content dark:text-dark-tremor-content">Explique por qué se debe anular esta gestión. El motivo quedará registrado.</p>
//             <textarea
//                 value={motivo}
//                 onChange={(e) => {
//                     setMotivo(e.target.value);
//                     if (error) setError('');
//                 }}
//                 rows={4}
//                 className="mt-4 w-full rounded-tremor-default border p-2 focus:ring-2 focus:ring-tremor-brand"
//                 placeholder="Ej: Lote cargado en el periodo incorrecto, correspondía a Julio 2025."
//             />
//             {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
//             <div className="flex justify-end space-x-3 mt-6">
//                 <button type="button" onClick={onClose} className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input">Cancelar</button>
//                 <button onClick={handleNext} className="whitespace-nowrap rounded-tremor-small bg-tremor-brand px-4 py-2 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis">Siguiente</button>
//             </div>
//         </div>
//     );
// };


// // --- Sub-componente: Paso 2 (Crear la nueva gestión de destino) ---
// const Paso2_CrearDestino = ({ gestionOriginal, setWizardData, setStep }) => {
    
//     // Adaptamos la configuración de tu formulario de conciliación para el wizard
//     const wizardFormConfig = {
//         title: () => "Paso 2: Crear la Nueva Gestión Correcta",
//         createEndpoint: "/gestion-licencia",
//         fields: [
//             { name: "empresaRut", label: "Empresa", type: "text", disabled: true },
//             { name: "periodo", label: "Periodo Correcto *", type: "periodo", validation: Yup.string().matches(/^(0[1-9]|1[0-2])\/\d{4}$/, "Formato MM/YYYY").required("El período es obligatorio"), transform: conciliacionFormConfig.fields.find(f => f.name === 'periodo').transform },
//             { name: "observaciones", label: "Observaciones", type: "text", placeholder: "Ej: Lote corregido desde gestión anulada..." },
//         ],
//     };

//     // La función que se ejecuta cuando GenericForm tiene éxito
//     const handleFormSubmitSuccess = (nuevaGestion) => {
//         if (nuevaGestion) {
//             setWizardData(prev => ({ ...prev, nuevaGestion: nuevaGestion }));
//             setStep(3);
//         }
//     };

//     return (
//         <div>
//             <GenericForm
//                 config={wizardFormConfig}
//                 initialData={{ empresaRut: gestionOriginal.empresaRut }}
//                 onClose={() => setStep(1)} // El botón "cancelar" de GenericForm ahora es "Atrás"
//                 // Modificamos fetchData para capturar el resultado
//                 fetchData={handleFormSubmitSuccess} 
//             />
//         </div>
//     );
// };


// // --- Sub-componente: Paso 3 (Confirmar la operación) ---
// const Paso3_Confirmar = ({ gestionOriginal, wizardData, handleExecute, setStep, isLoading }) => {
//     const [licencias, setLicencias] = useState([]);
//     const [loadingLicencias, setLoadingLicencias] = useState(true);

//     useEffect(() => {
//         const fetchLicenciasParaMover = async () => {
//             setLoadingLicencias(true);
//             try {
//                 const res = await apiService.get(`/gestion-licencia/${gestionOriginal.id}/licencias`);
//                 setLicencias(res.data.data || []);
//             } catch (error) {
//                 console.error("Error al cargar licencias para reasignar", error);
//             } finally {
//                 setLoadingLicencias(false);
//             }
//         };
//         fetchLicenciasParaMover();
//     }, [gestionOriginal.id]);

//     const licenciaIds = licencias.map(l => l.id);

//     return (
//         <div>
//             <h3 className="text-tremor-title font-semibold">Paso 3: Resumen y Confirmación</h3>
//             <div className="mt-4 space-y-4 p-4 border rounded-tremor-default bg-tremor-background-muted dark:bg-dark-tremor-background-muted">
//                 <div>
//                     <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">Acción a Realizar:</p>
//                     <p className="text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong">Anular gestión y reasignar su contenido.</p>
//                 </div>
//                 <div>
//                     <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">Gestión a Anular:</p>
//                     <p className="text-tremor-default text-red-600 font-semibold">{gestionOriginal.folioInterno} (Periodo: {gestionOriginal.periodo})</p>
//                 </div>
//                 <div>
//                     <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">Nueva Gestión de Destino:</p>
//                     <p className="text-tremor-default text-green-600 font-semibold">{wizardData.nuevaGestion?.folioInterno} (Periodo: {wizardData.nuevaGestion?.periodo})</p>
//                 </div>
//                 <div>
//                     <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">Contenido a Mover:</p>
//                     {loadingLicencias ? <p>Calculando...</p> : <p className="text-tremor-default">{licencias.length} licencias y todos sus anticipos/subsidios asociados.</p>}
//                 </div>
//                  <div>
//                     <p className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">Motivo:</p>
//                     <p className="text-tremor-default italic">"{wizardData.motivo}"</p>
//                 </div>
//             </div>
//             <p className="mt-4 text-tremor-label text-center">Esta acción no se puede deshacer.</p>
//             <div className="flex justify-between mt-6">
//                 <button onClick={() => setStep(2)} disabled={isLoading} className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium">Atrás</button>
//                 <button onClick={() => handleExecute(licenciaIds)} disabled={isLoading || loadingLicencias} className="whitespace-nowrap rounded-tremor-small bg-green-600 px-4 py-2 text-tremor-default font-medium text-white hover:bg-green-700">
//                     {isLoading ? 'Procesando...' : 'Confirmar y Ejecutar'}
//                 </button>
//             </div>
//         </div>
//     );
// };


// // --- Componente Principal del Wizard (Orquestador) ---
// const AnularYReasignarWizard = ({ gestionData, refreshData, onClose }) => {
//     const { runWithFeedback } = useActionFeedback();
//     const [step, setStep] = useState(1);
//     const [wizardData, setWizardData] = useState({});
//     const [isLoading, setIsLoading] = useState(false);

//     const handleExecute = async (licenciaIds) => {
//         setIsLoading(true);
//         await runWithFeedback({
//             action: async () => {
//                 // 1. Anular la gestión original
//                 await apiService.post(`/gestion-licencia/${gestionData.id}/anular`, { motivo: wizardData.motivo });
//                 // 2. Reasignar el contenido a la nueva gestión
//                 if (licenciaIds.length > 0) {
//                     await apiService.post('/gestion-licencia/reasignar', {
//                         licenciaIds,
//                         gestionDestinoId: wizardData.nuevaGestion.id,
//                         motivo: `Reasignado desde ${gestionData.folioInterno} por motivo: ${wizardData.motivo}`
//                     });
//                 }
//             },
//             loadingMessage: "Ejecutando anulación y reasignación...",
//             successMessage: "¡Proceso completado exitosamente!",
//             errorMessage: "Ocurrió un error durante el proceso."
//         });
//         setIsLoading(false);
//         if (refreshData) refreshData();
//         if (onClose) onClose();
//     };

//     const renderStep = () => {
//         switch (step) {
//             case 1:
//                 return <Paso1_Motivo wizardData={wizardData} setWizardData={setWizardData} setStep={setStep} onClose={onClose} />;
//             case 2:
//                 // Pasamos la gestión original para pre-poblar el RUT de la empresa
//                 return <Paso2_CrearDestino gestionOriginal={gestionData} setWizardData={setWizardData} setStep={setStep} />;
//             case 3:
//                 return <Paso3_Confirmar gestionOriginal={gestionData} wizardData={wizardData} handleExecute={handleExecute} setStep={setStep} isLoading={isLoading} />;
//             default:
//                 return <div>Paso desconocido.</div>;
//         }
//     };

//     return <div className="p-2">{renderStep()}</div>;
// };

// export default AnularYReasignarWizard;


// NUEVO:
// src/components/wizards/AnularYReasignarWizard.jsx
"use client";

import React, { useState, useEffect } from 'react';
import useActionFeedback from '@/hooks/useActionFeedback';
import apiService from '@/app/api/apiService';
import GenericForm from '../forms/GenericForm';
import { conciliacionFormConfig } from '@/config/forms/conciliacion.form.config';
import * as Yup from "yup";

// --- Sub-componente: Paso 1 (Motivo) ---
const Paso1_Motivo = ({ wizardData, setWizardData, setStep, onClose }) => {
    const [motivo, setMotivo] = useState(wizardData.motivo || '');
    const [error, setError] = useState('');

    const handleNext = () => {
        if (motivo.trim().length < 10) {
            setError('El motivo debe tener al menos 10 caracteres.');
            return;
        }
        setWizardData(prev => ({ ...prev, motivo }));
        setStep(2);
    };

    return (
        <div>
            <h3 className="text-tremor-title font-semibold text-tremor-content-strong">Paso 1 de 3: Motivo de la Anulación</h3>
            <p className="mt-2 text-tremor-default">Explique por qué se debe anular esta gestión. El motivo quedará registrado.</p>
            <textarea
                value={motivo}
                onChange={(e) => { setMotivo(e.target.value); if (error) setError(''); }}
                rows={4}
                className="mt-4 w-full rounded-tremor-default border p-2 focus:ring-2 focus:ring-tremor-brand"
                placeholder="Ej: Lote cargado en el periodo incorrecto, correspondía a Julio 2025."
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={onClose} className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium text-tremor-content shadow-tremor-input">Cancelar</button>
                <button onClick={handleNext} className="whitespace-nowrap rounded-tremor-small bg-tremor-brand px-4 py-2 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis">Siguiente</button>
            </div>
        </div>
    );
};

// --- Sub-componente: Paso 2 (Crear Destino) ---
const Paso2_CrearDestino = ({ gestionOriginal, setWizardData, setStep }) => {
    const wizardFormConfig = {
        title: () => "Paso 2 de 3: Crear la Nueva Gestión Correcta",
        createEndpoint: "/gestion-licencia",
        fields: [
            { name: "empresaRut", label: "Empresa", type: "text", disabled: true },
            { name: "periodo", label: "Periodo Correcto *", type: "periodo", ...conciliacionFormConfig.fields.find(f => f.name === 'periodo') },
            { name: "observaciones", label: "Observaciones", type: "text", placeholder: "Ej: Lote corregido desde gestión anulada..." },
        ],
    };

    const handleFormSubmitSuccess = (nuevaGestionCreada) => {
        if (nuevaGestionCreada) {
            setWizardData(prev => ({ ...prev, nuevaGestion: nuevaGestionCreada }));
            setStep(3);
        }
    };

//     return (
//         <GenericForm
//             config={wizardFormConfig}
//             initialData={{ empresaRut: gestionOriginal.empresaRut }}
//             onClose={() => setStep(1)}
//             fetchData={handleFormSubmitSuccess}
//         />
//     );
// };

return (
        <GenericForm
            config={wizardFormConfig}
            initialData={{ empresaRut: gestionOriginal.empresaRut }}
            onClose={() => setStep(1)} // El botón "Cancelar" sigue funcionando como "Atrás"
            fetchData={handleFormSubmitSuccess}
            closeOnSubmit={false} // <-- ¡Le decimos a GenericForm que no se cierre al terminar!
        />
    );
};

// --- Sub-componente: Paso 3 (Confirmar) ---
const Paso3_Confirmar = ({ gestionOriginal, wizardData, handleExecute, setStep, isLoading }) => {
    const [licencias, setLicencias] = useState([]);
    const [loadingLicencias, setLoadingLicencias] = useState(true);

    useEffect(() => {
        const fetchLicenciasParaMover = async () => {
            setLoadingLicencias(true);
            try {
                const res = await apiService.get(`/gestion-licencia/${gestionOriginal.id}/licencias`);
                setLicencias(res.data.data || []);
            } catch (error) { console.error("Error al cargar licencias", error); }
            finally { setLoadingLicencias(false); }
        };
        fetchLicenciasParaMover();
    }, [gestionOriginal.id]);

    const licenciaIds = licencias.map(l => l.id);

    return (
        <div>
            <h3 className="text-tremor-title font-semibold">Paso 3 de 3: Resumen y Confirmación</h3>
            <div className="mt-4 space-y-4 p-4 border rounded-tremor-default bg-tremor-background-muted">
                {/* ... (código del resumen sin cambios) ... */}
            </div>
            <p className="mt-4 text-tremor-label text-center">Esta acción no se puede deshacer.</p>
            <div className="flex justify-between mt-6">
                <button onClick={() => setStep(2)} disabled={isLoading} className="whitespace-nowrap rounded-tremor-small border border-tremor-border px-4 py-2 text-tremor-default font-medium">Atrás</button>
                <button onClick={() => handleExecute(licenciaIds)} disabled={isLoading || loadingLicencias} className="whitespace-nowrap rounded-tremor-small bg-green-600 px-4 py-2 text-tremor-default font-medium text-white hover:bg-green-700">
                    {isLoading ? 'Procesando...' : 'Confirmar y Ejecutar'}
                </button>
            </div>
        </div>
    );
};

// --- Componente Principal del Wizard ---
const AnularYReasignarWizard = ({ gestionData, refreshData, onClose }) => {
    const { runWithFeedback } = useActionFeedback();
    const [step, setStep] = useState(1);
    const [wizardData, setWizardData] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleExecute = async (licenciaIds) => {
        setIsLoading(true);
        await runWithFeedback({
            action: async () => {
                await apiService.post(`/gestion-licencia/${gestionData.id}/anular`, { motivo: wizardData.motivo });
                if (licenciaIds.length > 0) {
                    await apiService.post('/gestion-licencia/reasignar', {
                        licenciaIds,
                        gestionDestinoId: wizardData.nuevaGestion.id,
                        motivo: `Reasignado desde ${gestionData.folioInterno} por motivo: ${wizardData.motivo}`
                    });
                }
            },
            loadingMessage: "Ejecutando anulación y reasignación...",
            successMessage: "¡Proceso completado exitosamente!",
            errorMessage: "Ocurrió un error durante el proceso."
        });
        setIsLoading(false);
        if (refreshData) refreshData();
        if (onClose) onClose();
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <Paso1_Motivo wizardData={wizardData} setWizardData={setWizardData} setStep={setStep} onClose={onClose} />;
            case 2:
                return <Paso2_CrearDestino gestionOriginal={gestionData} setWizardData={setWizardData} setStep={setStep} />;
            case 3:
                return <Paso3_Confirmar gestionOriginal={gestionData} wizardData={wizardData} handleExecute={handleExecute} setStep={setStep} isLoading={isLoading} />;
            default:
                return <div>Paso desconocido.</div>;
        }
    };

    return <div className="p-2">{renderStep()}</div>;
};

export default AnularYReasignarWizard;