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

function isEnabledNewCaseCreation() {
  return (
    ENV.APP.ENABLE_CASE_CREATION === 'true' ||
    ENV.APP.ENABLE_CASE_CREATION === true
  )
}

export {
  isEnabledVlaamsParlement,
  isEnabledImpersonation,
  isEnabledNewCaseCreation,
}
