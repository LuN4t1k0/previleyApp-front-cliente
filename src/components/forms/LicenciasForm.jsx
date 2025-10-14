import React from "react";
import GenericForm from "@/components/forms/GenericForm";
import { licenciasFormConfig } from "@/config/forms/licencias.form.config";

const LicenciasFormModal = (props) => {

  return (
    <GenericForm 
      config={licenciasFormConfig} 
      {...props} 
      fetchData={props.refreshData} 
    />
  );
};

export default LicenciasFormModal;