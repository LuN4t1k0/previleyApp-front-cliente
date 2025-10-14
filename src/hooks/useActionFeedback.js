// src/hooks/useActionFeedback.js
import { toast } from "react-hot-toast";

const useActionFeedback = () => {
  const runWithFeedback = async ({
    action,
    loadingMessage = "Procesando...",
    successMessage = null,
    errorMessage = "Ocurrió un error",
  }) => {
    const toastId = toast.loading(loadingMessage);
    try {
      const result = await action();
      toast.dismiss(toastId);
      if (successMessage) {
        toast.success(successMessage);
      }
      return result;
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error(errorMessage);
      throw err;
    }
  };

  return { runWithFeedback };
};

export default useActionFeedback;
