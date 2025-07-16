import ENV from 'frontend-kaleidos/config/environment';

function isEnabledImpersonation() {
  return (
    ENV.APP.ENABLE_IMPERSONATION === 'true' ||
    ENV.APP.ENABLE_IMPERSONATION === true
  );
}

function isEnabledVlaamsParlement() {
  return (
    ENV.APP.ENABLE_VLAAMS_PARLEMENT === 'true' ||
    ENV.APP.ENABLE_VLAAMS_PARLEMENT === true
  );
}

function isEnabledCabinetSubmissions() {
  return (
    ENV.APP.ENABLE_CABINET_SUBMISSIONS === 'true' ||
    ENV.APP.ENABLE_CABINET_SUBMISSIONS === true
  );
}

function isDisabledSessionPolling() {
  return (
    ENV.APP.DISABLE_SESSION_POLLING === 'true' ||
    ENV.APP.DISABLE_SESSION_POLLING === true
  );
}

export {
  isEnabledVlaamsParlement,
  isEnabledImpersonation,
  isEnabledCabinetSubmissions,
  isDisabledSessionPolling,
}
