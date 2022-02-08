import AbstractPublicationsOverviewBaseRoute from '../_base/route';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class PublicationsOverviewTranslationRoute extends AbstractPublicationsOverviewBaseRoute {
  modelGetQueryFilter() {
    const filter = {
      status: {
        ':uri:': CONSTANTS.PUBLICATION_STATUSES.TO_TRANSLATIONS,
      },
    };
    return filter;
  }
}
