import React from "react";
import GenericForm from "@/components/forms/GenericForm";
import { subsidiosFormConfig } from "@/config/forms/subsidios.form.config";

const SubsidioForm = (props) => {

  return (
    <GenericForm 
      config={subsidiosFormConfig} 
      {...props} 
      fetchData={props.refreshData} 
    />
  );
};

export default SubsidioForm;