import React, { useState } from 'react';

const TramoFormContent = ({ initialValues, onSubmit, onClose, loading }) => {
  const [values, setValues] = useState({
    trabajadorId: initialValues?.trabajadorId || '',
    desde: initialValues?.desde ?? '',
    hasta: initialValues?.hasta ?? '',
    porcentaje: initialValues?.porcentaje ?? '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      trabajadorId: Number(values.trabajadorId),
      desde: Number(values.desde),
      hasta: Number(values.hasta),
      porcentaje: Number(values.porcentaje),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm">Desde</label>
        <input
          type="number"
          name="desde"
          value={values.desde}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
          min="0"
          step="0.01"
          required
        />
      </div>
      <div>
        <label className="block text-sm">Hasta</label>
        <input
          type="number"
          name="hasta"
          value={values.hasta}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
          min="0"
          step="0.01"
          required
        />
      </div>
      <div>
        <label className="block text-sm">Porcentaje (%)</label>
        <input
          type="number"
          name="porcentaje"
          value={values.porcentaje}
          onChange={handleChange}
          className="border rounded px-2 py-1 w-full"
          min="0"
          max="100"
          step="0.01"
          required
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="px-3 py-2" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};

export default TramoFormContent;

