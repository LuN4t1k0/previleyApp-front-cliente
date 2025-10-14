"use client";

import React, { useMemo } from "react";
import { SearchSelect, SearchSelectItem } from "@tremor/react";

const normalizeString = (value) => (typeof value === "number" ? value.toString() : value || "");
const stripDiacritics = (value) =>
  normalizeString(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
const stripRutSeparators = (value) => normalizeString(value).replace(/[.\-]/g, "").trim();

const buildLabel = (empresa) => {
  const rawName =
    empresa?.nombre ||
    empresa?.razonSocial ||
    empresa?.fantasia ||
    empresa?.label ||
    "Sin nombre";
  const name = normalizeString(rawName).trim();
  const rut = normalizeString(
    empresa?.empresaRut || empresa?.rut || empresa?.value
  ).trim();

  if (!rut) return name || "Sin nombre";

  return `${name || "Sin nombre"} (${rut})`;
};

const buildSearchValue = (empresa) => {
  const name = normalizeString(
    empresa?.nombre || empresa?.razonSocial || empresa?.fantasia || empresa?.label
  );
  const rut = normalizeString(empresa?.empresaRut || empresa?.rut || empresa?.value);

  const tokens = [name, rut, stripDiacritics(name), stripRutSeparators(rut)]
    .filter(Boolean)
    .map((token) => token.toLowerCase());

  return Array.from(new Set(tokens)).join(" ");
};

const dedupeByValue = (empresas = []) => {
  const seen = new Set();
  const deduped = [];

  empresas.forEach((empresa) => {
    const value = normalizeString(
      empresa?.empresaRut || empresa?.value || empresa?.rut
    ).trim();

    if (!value || seen.has(value)) return;
    seen.add(value);
    deduped.push({
      value,
      label: buildLabel(empresa),
      searchValue: buildSearchValue(empresa),
    });
  });

  return deduped;
};

export const mapEmpresasToSearchOptions = (empresas = []) => dedupeByValue(empresas);

const EmpresaSearchSelect = ({
  empresas = [],
  value,
  onValueChange,
  placeholder = "Buscar empresa por nombre o RUT...",
  className,
  disabled = false,
  includeEmptyOption = false,
  emptyOptionLabel = "Selecciona una empresa",
  emptyOptionValue = "",
}) => {
  const options = useMemo(() => dedupeByValue(empresas), [empresas]);

  const handleChange = (selectedValue) => {
    if (onValueChange) {
      onValueChange(selectedValue);
    }
  };

  return (
    <SearchSelect
      value={normalizeString(value)}
      onValueChange={handleChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    >
      {includeEmptyOption && (
        <SearchSelectItem value={emptyOptionValue} searchValue="">
          {emptyOptionLabel}
        </SearchSelectItem>
      )}
      {options.map((option) => (
        <SearchSelectItem
          key={option.value}
          value={option.value}
          searchValue={option.searchValue}
        >
          {option.label}
        </SearchSelectItem>
      ))}
    </SearchSelect>
  );
};

export default EmpresaSearchSelect;
