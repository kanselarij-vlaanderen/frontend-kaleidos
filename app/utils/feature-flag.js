import ENV from 'frontend-kaleidos/config/environment';

function enableVlaamsParlement() {
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

export { enableVlaamsParlement, isEnabledNewCaseCreation };