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

export {
  isEnabledVlaamsParlement,
  isEnabledImpersonation,
  isEnabledCabinetSubmissions,
}
