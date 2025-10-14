import * as XLSX from "xlsx";

export const downloadExcelFromJson = (jsonData, sheetName, fileName) => {
  const worksheet = XLSX.utils.json_to_sheet(jsonData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
// NUEVO:
export const downloadResumenYDifExcel = ({
  createdRecords = [],
  updatedRecords = [],
  duplicateRecords = [],
  ignoredTerminalRecords = [],
  differences = [],
}) => {
  const resumen = [];

  const append = (records, tipo) => {
    records.forEach((r) => {
      resumen.push({
        Tipo: tipo,
        RUT: r.trabajadorRut,
        Nombre: r.nombreCompleto,
        Periodo: r.periodoPago,
        Estado: r.estado,
      });
    });
  };

  append(createdRecords, "Creado");
  append(updatedRecords, "Actualizado");
  append(duplicateRecords, "Duplicado");
  append(ignoredTerminalRecords, "Ignorado (resuelto)");

  const resumenSheet = XLSX.utils.json_to_sheet(resumen);

  const diferenciaSheet = XLSX.utils.json_to_sheet(
    differences.map((d) => ({
      ID: d.id,
      CamposModificados: Object.keys(d.differences).join(", "),
      Diferencias: JSON.stringify(d.differences),
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, resumenSheet, "ResumenCarga");
  XLSX.utils.book_append_sheet(workbook, diferenciaSheet, "Diferencias");

  XLSX.writeFile(workbook, "resumen_carga_detalle.xlsx");
};
