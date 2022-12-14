import ENV from 'frontend-kaleidos/config/environment';

export function initialize(appInstance) {
  const plausible = appInstance.lookup('service:plausible');
  const { domain, apiHost } = ENV.plausible;
  if (
    domain !== '{{ANALYTICS_APP_DOMAIN}}' &&
    apiHost !== '{{ANALYTICS_API_HOST}}'
  ) {
    plausible.enable({
      domain,
      apiHost,
    });
  }
}

export default {
  initialize
};
