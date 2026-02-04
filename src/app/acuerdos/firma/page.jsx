"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

const buildApiUrl = (path) => {
  const base =
    process.env.NEXT_PUBLIC_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  return `${base.replace(/\/$/, "")}${path}`;
};

const statusTone = (status) => {
  if (status === "danger") return "bg-rose-50 text-rose-700 border-rose-200";
  if (status === "warning") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "success") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const ConsentBadge = ({ text }) => (
  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
    {text}
  </span>
);

const FirmaAcuerdoContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const apiBase = useMemo(() => buildApiUrl("/api/v1/public"), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acuerdo, setAcuerdo] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchAcuerdo = async () => {
      if (!token) {
        setError("Link inválido. Falta el token.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${apiBase}/acuerdos/sign?token=${encodeURIComponent(token)}`
        );
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.message || payload?.error || "No se pudo cargar el acuerdo.");
        }
        setAcuerdo(payload?.data || null);
      } catch (err) {
        setError(err?.message || "No se pudo cargar el acuerdo.");
      } finally {
        setLoading(false);
      }
    };

    fetchAcuerdo();
  }, [apiBase, token]);

  const handleRequestOtp = async () => {
    if (!token) return;
    setOtpLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/acuerdos/sign/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "No se pudo enviar el OTP.");
      }
      setOtpRequested(true);
    } catch (err) {
      setError(err?.message || "No se pudo enviar el OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!token) return;
    setConfirmLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBase}/acuerdos/sign/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          otp: otpValue,
          consentimientoVersion: acuerdo?.consentimientoVersion || "v1",
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "No se pudo firmar el acuerdo.");
      }
      setSuccess(payload?.data || { signedAt: new Date().toISOString() });
    } catch (err) {
      setError(err?.message || "No se pudo firmar el acuerdo.");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">
            Firma de acuerdo
          </h1>
          <p className="text-sm text-slate-600">
            Revisa el documento, confirma tu consentimiento y valida con un OTP.
          </p>
          <div className="flex flex-wrap gap-2">
            <ConsentBadge text="Proceso seguro con OTP" />
            <ConsentBadge text="Documento inmutable" />
          </div>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="h-4 w-40 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-64 rounded bg-slate-100 animate-pulse" />
            <div className="h-64 rounded bg-slate-100 animate-pulse" />
          </div>
        ) : error ? (
          <div className={`rounded-2xl border px-5 py-4 text-sm ${statusTone("danger")}`}>
            {error}
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Acuerdo
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    #{acuerdo?.acuerdoId}
                  </p>
                  <p className="text-sm text-slate-600">
                    {acuerdo?.empresaNombre} · {acuerdo?.trabajadorNombre}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Versión documento
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {acuerdo?.documentVersion || "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600">
                Hash: <span className="font-mono break-all">{acuerdo?.documentSha256 || "—"}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Documento PDF
                </h2>
                {acuerdo?.pdfUrl ? (
                  <a
                    href={acuerdo.pdfUrl}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Descargar PDF
                  </a>
                ) : null}
              </div>
              {acuerdo?.pdfUrl ? (
                <iframe
                  title="Documento de acuerdo"
                  src={acuerdo.pdfUrl}
                  className="w-full h-[620px] bg-white"
                />
              ) : (
                <div className="p-6 text-sm text-slate-500">
                  No se pudo cargar el documento.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className={`rounded-xl border px-4 py-3 text-sm ${statusTone("neutral")}`}>
                <p className="font-medium text-slate-900">
                  Consentimiento informado
                </p>
                <p className="text-slate-600 mt-1">
                  Declaro haber leído el acuerdo y acepto los términos presentados.
                </p>
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(event) => setConsentChecked(event.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300"
                />
                Confirmo mi consentimiento para firmar el acuerdo.
              </label>

              {!otpRequested ? (
                <button
                  onClick={handleRequestOtp}
                  disabled={!consentChecked || otpLoading}
                  className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    !consentChecked || otpLoading
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {otpLoading ? "Enviando OTP..." : "Enviar código OTP"}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Código OTP
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpValue}
                      onChange={(event) =>
                        setOtpValue(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-lg tracking-[0.4em] text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="******"
                    />
                  </div>
                  <button
                    onClick={handleConfirm}
                    disabled={otpValue.length !== 6 || confirmLoading}
                    className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${
                      otpValue.length !== 6 || confirmLoading
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {confirmLoading ? "Firmando..." : "Firmar acuerdo"}
                  </button>
                </div>
              )}
            </div>

            {success ? (
              <div className={`rounded-2xl border px-6 py-5 text-sm ${statusTone("success")}`}>
                <p className="font-semibold text-emerald-700">
                  Firma completada correctamente.
                </p>
                {success?.receiptUrl ? (
                  <a
                    href={success.receiptUrl}
                    className="mt-2 inline-flex text-sm font-medium text-emerald-700 underline"
                  >
                    Descargar comprobante de aceptación
                  </a>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default function FirmaAcuerdoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-5xl px-6 py-12 space-y-6">
            <div className="h-6 w-48 rounded bg-slate-100 animate-pulse" />
            <div className="h-4 w-72 rounded bg-slate-100 animate-pulse" />
            <div className="h-80 rounded-2xl border border-slate-200 bg-white" />
          </div>
        </div>
      }
    >
      <FirmaAcuerdoContent />
    </Suspense>
  );
}
