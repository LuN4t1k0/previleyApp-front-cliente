"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button, TextInput, Switch, Badge } from "@tremor/react";
import apiService from "@/app/api/apiService";
import { showErrorAlert, showSuccessAlert } from "@/utils/alerts";

function EmailChip({ email, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(email)}
      className={`px-2 py-1 rounded text-sm border ${selected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"}`}
    >
      {email}
    </button>
  );
}

export default function PrefacturaSendEmailModal({ initialData, onClose }) {
  const prefactura = initialData;
  const empresaRut = prefactura?.empresaRut;

  const [loading, setLoading] = useState(false);
  const [correos, setCorreos] = useState([]); // { email, tipo }
  const [includeFacturacion, setIncludeFacturacion] = useState(true);
  const [includeNotificacion, setIncludeNotificacion] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [adHoc, setAdHoc] = useState("");
  const [adHocList, setAdHocList] = useState([]);
  const [forceResend, setForceResend] = useState(false);

  const suggested = useMemo(() => {
    return correos.filter(c => (c.tipo === 'FACTURACION' && includeFacturacion) || (c.tipo === 'NOTIFICACION' && includeNotificacion));
  }, [correos, includeFacturacion, includeNotificacion]);

  const toggleSelect = useCallback((email) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(suggested.map(c => c.email)));
  }, [suggested]);
  const clearAll = useCallback(() => setSelected(new Set()), []);

  const addAdHoc = () => {
    const value = (adHoc || '').trim();
    if (!value) return;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      showErrorAlert("Correo inválido", "Ingresa un email válido.");
      return;
    }
    if (!adHocList.includes(value)) setAdHocList((l) => [...l, value]);
    setAdHoc("");
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!empresaRut) return;
      try {
        const res = await apiService.get("/empresa-correos", { params: { empresaRut, limit: 200 } });
        if (!mounted) return;
        const items = (res?.data?.data || []).map(r => ({ email: r.email, tipo: r.tipo }));
        setCorreos(items);
        const defaults = items.filter(c => (c.tipo === 'FACTURACION' || c.tipo === 'NOTIFICACION')).map(c => c.email);
        setSelected(new Set(defaults));
      } catch (e) {
        showErrorAlert("No se pudieron cargar los correos", e?.message || "");
      }
    };
    load();
    return () => { mounted = false; };
  }, [empresaRut]);

  const onSend = async () => {
    try {
      setLoading(true);
      const to = [];
      const cc = [];
      // Distribuir: por defecto FACTURACION→to, NOTIFICACION→cc
      for (const c of suggested) {
        if (selected.has(c.email)) {
          if (c.tipo === 'FACTURACION') to.push(c.email);
          else if (c.tipo === 'NOTIFICACION') cc.push(c.email);
        }
      }
      // Ad-hoc los agregamos a TO
      for (const e of adHocList) if (!to.includes(e) && !cc.includes(e)) to.push(e);

      await apiService.post(`/prefacturas/enviar/${prefactura.id}`, {
        recipients: { to, cc, bcc: [] },
        options: { force: forceResend },
      });
      showSuccessAlert("Envío encolado", "La prefactura fue preparada para envío.");
      onClose?.();
    } catch (e) {
      showErrorAlert("No se pudo encolar el envío", e?.message || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Empresa</div>
          <div className="font-medium">{empresaRut || "(desconocida)"}</div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Facturación</span>
            <Switch checked={includeFacturacion} onChange={setIncludeFacturacion} />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Notificación</span>
            <Switch checked={includeNotificacion} onChange={setIncludeNotificacion} />
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 mb-2">Destinatarios sugeridos</div>
        <div className="flex flex-wrap gap-2">
          {suggested.length === 0 && (
            <Badge color="yellow">No hay correos configurados en la empresa</Badge>
          )}
          {suggested.map((c) => (
            <EmailChip
              key={`${c.email}-${c.tipo}`}
              email={c.email}
              selected={selected.has(c.email)}
              onToggle={toggleSelect}
            />
          ))}
        </div>
        <div className="mt-2 flex space-x-2">
          <Button size="xs" variant="secondary" onClick={selectAll}>Seleccionar todos</Button>
          <Button size="xs" variant="secondary" onClick={clearAll}>Limpiar</Button>
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-600 mb-1">Agregar correos ad-hoc</div>
        <div className="flex space-x-2">
          <TextInput value={adHoc} onChange={(e) => setAdHoc(e.target.value)} placeholder="email@dominio.com" />
          <Button onClick={addAdHoc} variant="secondary">Agregar</Button>
        </div>
        {adHocList.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {adHocList.map((e) => (
              <EmailChip key={e} email={e} selected={true} onToggle={() => setAdHocList((l) => l.filter(x => x !== e))} />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <Switch checked={forceResend} onChange={setForceResend} />
          <span className="text-sm">Reenviar esta versión (forzar)</span>
          <a
            className="text-blue-600 text-sm underline ml-3"
            href={`/admin/empresa-correos`}
            target="_blank"
            rel="noreferrer"
          >
            Configurar correos de la empresa
          </a>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button color="blue" onClick={onSend} loading={loading} disabled={!selected.size && adHocList.length === 0}>Enviar</Button>
        </div>
      </div>
    </div>
  );
}
