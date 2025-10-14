import React from "react";
import GenericForm from "@/components/forms/GenericForm";
import {conciliacionFormConfig} from "@/config/forms/conciliacion.form.config"

const ConciliacionForm = (props) => {

  return (
    <GenericForm 
      config={conciliacionFormConfig} 
      {...props} 
      fetchData={props.refreshData} 
    />
  );
};

export default ConciliacionForm;