import * as XLSX from "xlsx";

const numberFormatter = new Intl.NumberFormat("es-CL");
const generatedAtFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "medium",
  timeStyle: "short",
});

const safeText = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatNumber = (value) => numberFormatter.format(Number(value || 0));

const buildFileName = ({ periodo, scopeMode, scopeName, extension }) => {
  const scopeSlug = String(scopeName || scopeMode || "general")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `plan-trabajo-mora-${periodo || "periodo"}-${scopeSlug || "general"}.${extension}`;
};

export const buildPlanTrabajoRows = ({
  items = [],
  getMotivoOrden,
  getProximaAccion,
}) =>
  items.map((item, index) => ({
    Orden: index + 1,
    Gestion: item.folio || `Gestion #${item.gestionMoraId}`,
    Estado: item.estadoGestion || "sin estado",
    Empresa: item.empresaNombre || item.empresaRut || "sin empresa",
    "RUT empresa": item.empresaRut || "",
    Entidad: item.entidadNombre || "Entidad sin nombre",
    Riesgo: item.nivelRiesgo || "bajo",
    "Origen prioridad": item.origenPrioridad || "sugerida",
    "Deuda pendiente": Number(item.deudaPendiente || 0),
    "Deuda judicial": Number(item.montoJudicial || 0),
    "Casos judiciales": Number(item.casosJudiciales || 0),
    "Deuda pre judicial": Number(item.montoPreJudicial || 0),
    "Casos pre judiciales": Number(item.casosPreJudiciales || 0),
    "Deuda no judicial": Number(item.montoNoJudicial || 0),
    "Casos no judiciales": Number(item.casosNoJudiciales || 0),
    "Motivo del orden": getMotivoOrden(item),
    "Proxima accion": getProximaAccion(item),
  }));

export const exportPlanTrabajoExcel = ({
  rows,
  resumen,
  periodo,
  scopeMode,
  scopeName,
}) => {
  const workbook = XLSX.utils.book_new();
  const resumenRows = [
    { Indicador: "Periodo", Valor: periodo || "" },
    { Indicador: "Alcance", Valor: scopeMode === "grupo" ? "Grupo empresarial" : "Empresa" },
    { Indicador: "Seleccion", Valor: scopeName || "" },
    { Indicador: "Gestiones priorizadas", Valor: rows.length },
    { Indicador: "Pendiente priorizado", Valor: Number(resumen?.totalPendiente || 0) },
    { Indicador: "Casos judiciales", Valor: Number(resumen?.casosJudiciales || 0) },
    { Indicador: "Monto judicial", Valor: Number(resumen?.totalJudicial || 0) },
    { Indicador: "Casos pre judiciales", Valor: Number(resumen?.casosPreJudiciales || 0) },
    { Indicador: "Monto pre judicial", Valor: Number(resumen?.totalPreJudicial || 0) },
    { Indicador: "Prioridades manuales", Valor: Number(resumen?.manuales || 0) },
    { Indicador: "Orden automatico", Valor: Number(resumen?.sugeridas || 0) },
  ];

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(resumenRows),
    "Resumen"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(rows),
    "Plan de trabajo"
  );

  XLSX.writeFile(workbook, buildFileName({ periodo, scopeMode, scopeName, extension: "xlsx" }));
};

export const exportPlanTrabajoPdf = async ({
  rows,
  resumen,
  periodo,
  scopeMode,
  scopeName,
  formatCLP,
}) => {
  const html2pdf = (await import("html2pdf.js")).default;
  const generatedAt = generatedAtFormatter.format(new Date());
  const html = document.createElement("div");
  html.innerHTML = `
    <section style="font-family: Arial, sans-serif; color: #0f172a; padding: 24px;">
      <header style="border-bottom: 2px solid #10b981; padding-bottom: 16px; margin-bottom: 18px;">
        <p style="margin: 0 0 6px; color: #059669; font-size: 11px; font-weight: 700; text-transform: uppercase;">Mora presunta</p>
        <h1 style="margin: 0; font-size: 24px;">Plan de trabajo</h1>
        <p style="margin: 8px 0 0; color: #475569; font-size: 12px;">
          ${safeText(scopeMode === "grupo" ? "Grupo empresarial" : "Empresa")}: ${safeText(scopeName || "")} - Periodo ${safeText(periodo || "")} - Generado ${safeText(generatedAt)}
        </p>
      </header>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px;">
        ${[
          ["Gestiones", formatNumber(rows.length)],
          ["Pendiente", formatCLP(resumen?.totalPendiente)],
          ["Judicial", `${formatNumber(resumen?.casosJudiciales)} casos`],
          ["Pre judicial", `${formatNumber(resumen?.casosPreJudiciales)} casos`],
        ]
          .map(
            ([label, value]) => `
              <article style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px;">
                <p style="margin: 0; color: #64748b; font-size: 9px; font-weight: 700; text-transform: uppercase;">${safeText(label)}</p>
                <p style="margin: 6px 0 0; font-size: 15px; font-weight: 700;">${safeText(value)}</p>
              </article>
            `
          )
          .join("")}
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
        <thead>
          <tr style="background: #f1f5f9;">
            ${["Orden", "Gestion", "Empresa", "Entidad", "Pendiente", "Judicial", "Pre judicial", "Motivo", "Proxima accion"]
              .map((header) => `<th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">${safeText(header)}</th>`)
              .join("")}
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  <td style="border: 1px solid #e2e8f0; padding: 5px;">${safeText(row.Orden)}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 5px;">${safeText(row.Gestion)}<br><span style="color: #64748b;">${safeText(row.Estado)}</span></td>
                  <td style="border: 1px solid #e2e8f0; padding: 5px;">${safeText(row.Empresa)}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 5px;">${safeText(row.Entidad)}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 5px;">${safeText(formatCLP(row["Deuda pendiente"]))}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 5px;">${safeText(formatNumber(row["Casos judiciales"]))}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 5px;">${safeText(formatNumber(row["Casos pre judiciales"]))}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 5px;">${safeText(row["Motivo del orden"])}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 5px;">${safeText(row["Proxima accion"])}</td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </section>
  `;

  await html2pdf()
    .set({
      margin: 8,
      filename: buildFileName({ periodo, scopeMode, scopeName, extension: "pdf" }),
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    })
    .from(html)
    .save();
};
