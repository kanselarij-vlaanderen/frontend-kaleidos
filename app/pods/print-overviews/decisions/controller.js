import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { getPrintOverviewTitle } from 'frontend-kaleidos/utils/print-overview-util';

export default Controller.extend({
  titleTranslationKey: 'decisions-of-kind',
  titlePrintKey: 'decisions-pdf-name',
  routeModel: 'print-overviews.decisions',
  meeting: null,
  intl: inject(),

  title: computed('model.createdFor', 'titleTranslationKey', async function() {
    const date = this.get('model.createdFor.plannedStart');
    if (this.titleTranslationParams) {
      const translatedTitleWithParams = this.intl.t(this.titleTranslationKey, this.titleTranslationParams);
      return getPrintOverviewTitle(translatedTitleWithParams, date);
    }
    const translatedTitle = this.intl.t(this.titleTranslationKey);
    return getPrintOverviewTitle(translatedTitle, date);
  }),

  titleTranslationParams: computed('model.createdFor', function() {
    const meeting = this.get('model.createdFor');
    const kindLabel = meeting.get('kindToShow.altLabel');
    return {
      kind: kindLabel,
    };
  }),
});
