
import React, { useState } from 'react';
import {
  Divider,
  NumberInput,
  Select,
  SelectItem,
  TextInput,
  Textarea,
  Button,
} from '@tremor/react';

export default function UsuarioFormWizard() {
  const [step, setStep] = useState(1);
  const [rol, setRol] = useState('cliente');

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setStep((prevStep) => (prevStep > 1 ? prevStep - 1 : prevStep));
  };

  return (
    <>
      <form>
        {step === 1 && (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div>
              <h2 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Información Personal
              </h2>
              <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                Ingresa la información básica del usuario.
              </p>
            </div>
            <div className="sm:max-w-3xl md:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                <div className="col-span-full sm:col-span-3">
                  <label
                    htmlFor="first-name"
                    className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                  >
                    Nombre
                  </label>
                  <TextInput
                    type="text"
                    id="first-name"
                    name="first-name"
                    placeholder="Juan"
                    className="mt-2"
                  />
                </div>
                <div className="col-span-full sm:col-span-3">
                  <label
                    htmlFor="last-name"
                    className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                  >
                    Apellido
                  </label>
                  <TextInput
                    type="text"
                    id="last-name"
                    name="last-name"
                    placeholder="Pérez"
                    className="mt-2"
                  />
                </div>
                <div className="col-span-full">
                  <label
                    htmlFor="email"
                    className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                  >
                    Email
                  </label>
                  <TextInput
                    type="email"
                    id="email"
                    name="email"
                    placeholder="juan.perez@empresa.com"
                    className="mt-2"
                  />
                </div>
                <div className="col-span-full">
                  <label
                    htmlFor="rol"
                    className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                  >
                    Rol
                  </label>
                  <Select
                    id="rol"
                    name="rol"
                    defaultValue="cliente"
                    className="mt-2"
                    onChange={(e) => setRol(e.target.value)}
                  >
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="trabajador">Trabajador</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && rol !== 'cliente' && (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div>
              <h2 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                Información del Trabajador
              </h2>
              <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                Ingresa la información específica del trabajador.
              </p>
            </div>
            <div className="sm:max-w-3xl md:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                <div className="col-span-full sm:col-span-3">
                  <label
                    htmlFor="direccion"
                    className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                  >
                    Dirección
                  </label>
                  <TextInput
                    type="text"
                    id="direccion"
                    name="direccion"
                    placeholder="Calle Falsa 123"
                    className="mt-2"
                  />
                </div>
                <div className="col-span-full sm:col-span-3">
                  <label
                    htmlFor="telefono"
                    className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                  >
                    Teléfono
                  </label>
                  <TextInput
                    type="text"
                    id="telefono"
                    name="telefono"
                    placeholder="987654321"
                    className="mt-2"
                  />
                </div>
                <div className="col-span-full">
                  <label
                    htmlFor="fecha-ingreso"
                    className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
                  >
                    Fecha de Ingreso
                  </label>
                  <TextInput
                    type="date"
                    id="fecha-ingreso"
                    name="fecha-ingreso"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <Divider className="my-14" />
        <div className="flex items-center justify-end space-x-4">
          {step > 1 && (
            <Button
              type="button"
              onClick={handlePrevStep}
              className="whitespace-nowrap rounded-tremor-small px-4 py-2.5 text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
            >
              Atrás
            </Button>
          )}
          {step < 2 && (
            <Button
              type="button"
              onClick={handleNextStep}
              className="whitespace-nowrap rounded-tremor-default bg-tremor-brand px-4 py-2.5 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis"
            >
              Siguiente
            </Button>
          )}
          {step === 2 && (
            <Button
              type="submit"
              className="whitespace-nowrap rounded-tremor-default bg-tremor-brand px-4 py-2.5 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis"
            >
              Guardar
            </Button>
          )}
        </div>
      </form>
    </>
  );
}
