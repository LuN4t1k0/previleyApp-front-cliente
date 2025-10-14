import React from "react";
import GenericForm from "@/components/forms/GenericForm";
import { anticiposFormConfig } from "@/config/forms/anticipos.form.config"

const AnticiposForm = (props) => {

  return (
    <GenericForm 
      config={anticiposFormConfig} 
      {...props} 
      fetchData={props.refreshData} 
    />
  );
};

export default AnticiposForm;