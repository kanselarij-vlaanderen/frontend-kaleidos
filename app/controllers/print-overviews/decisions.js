import Controller from '@ember/controller';
import PrintOverviewMixin from 'fe-redpencil/mixins/print-overview-mixin';
import { computed } from '@ember/object';

export default Controller.extend(PrintOverviewMixin, {
  titleTranslationKey: 'decisions-of-kind',
  titlePrintKey: 'decisions-pdf-name',
  routeModel: 'print-overviews.decisions',

  titleTranslationParams: computed('model.createdFor', function () {
    const meeting = this.get('model.createdFor')
    const fullProcedure = meeting.get('kindToShow.fullProcedure');
    return { kind: fullProcedure };
  }),
});
