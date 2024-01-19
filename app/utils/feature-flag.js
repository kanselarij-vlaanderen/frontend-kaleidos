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

export {
  isEnabledVlaamsParlement,
  isEnabledImpersonation,
}
