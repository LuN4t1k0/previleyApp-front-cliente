import React from "react";
import GenericForm from "@/components/forms/GenericForm";
import { empresaFormConfig } from "@/config/forms/empresa.form.config";

const EmpresaFormModal = (props) => {

  return <GenericForm config={empresaFormConfig} {...props} />;
};

export default EmpresaFormModal;

