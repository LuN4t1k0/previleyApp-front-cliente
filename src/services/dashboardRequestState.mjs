export const createLatestRequestTracker = () => {
  let currentRequest = 0;

  return {
    begin() {
      currentRequest += 1;
      return currentRequest;
    },
    isCurrent(requestId) {
      return requestId === currentRequest;
    },
  };
};

export const createDashboardNotConfiguredError = (serviceKey) => {
  const error = new Error(
    `No existe un dashboard para el servicio ${serviceKey}.`
  );
  error.code = "DASHBOARD_NOT_CONFIGURED";
  return error;
};

