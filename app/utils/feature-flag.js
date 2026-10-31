import ENV from 'frontend-kaleidos/config/environment';

function isEnabledImpersonation() {
  return (
    ENV.APP.ENABLE_IMPERSONATION === 'true' ||
    ENV.APP.ENABLE_IMPERSONATION === true
  );
}

function isDisabledSessionPolling() {
  return (
    ENV.APP.DISABLE_SESSION_POLLING === 'true' ||
    ENV.APP.DISABLE_SESSION_POLLING === true
  );
}

export {
  isEnabledImpersonation,
  isDisabledSessionPolling,
}
