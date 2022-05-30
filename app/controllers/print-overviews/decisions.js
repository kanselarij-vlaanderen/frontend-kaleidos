import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { getPrintOverviewTitle } from 'frontend-kaleidos/utils/print-overview-util';
import { kindPrintLabel } from '../../../helpers/kind-print-label';

// TODO: octane-refactor
/* eslint-disable ember/no-get */
// eslint-disable-next-line ember/no-classic-classes
export default Controller.extend({
  titleTranslationKey: 'decisions-of-kind',
  titlePrintKey: 'decisions-pdf-name',
  routeModel: 'print-overviews.decisions',
  meeting: null,
  intl: inject(),

  title: computed('model.createdFor.plannedStart', 'titleTranslationKey', 'titleTranslationParams', async function() {
    const date = this.get('model.createdFor.plannedStart');
    const titleTranslationParams = await this.titleTranslationParams;
    if (titleTranslationParams) {
      const translatedTitleWithParams = this.intl.t(this.titleTranslationKey, titleTranslationParams);
      return getPrintOverviewTitle(translatedTitleWithParams, date);
    }
    const translatedTitle = this.intl.t(this.titleTranslationKey);
    return getPrintOverviewTitle(translatedTitle, date);
  }),

  titleTranslationParams: computed('model.createdFor', async function() {
    const meeting = this.get('model.createdFor');
    const kind = await meeting.get('kind');
    const kindLabel = kindPrintLabel(kind);
    return {
      kind: kindLabel,
    };
  }),
});
