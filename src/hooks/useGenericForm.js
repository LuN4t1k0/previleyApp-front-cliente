// hooks/useGenericForm.js
import { useFormik } from 'formik';

export const useGenericForm = (initialValues, validationSchema, onSubmit) => {
  return useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });
};
