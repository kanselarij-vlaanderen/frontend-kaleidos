import ENV from 'frontend-kaleidos/config/environment';

function enableVlaamsParlement() {
  return (
    ENV.APP.ENABLE_VLAAMS_PARLEMENT === 'true' ||
    ENV.APP.ENABLE_VLAAMS_PARLEMENT === true
  );
}

export { enableVlaamsParlement };