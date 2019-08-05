import Controller from '@ember/controller';
import PrintOverviewMixin from 'fe-redpencil/mixins/print-overview-mixin';

export default Controller.extend(PrintOverviewMixin, {
  titleTranslationKey: 'press-agenda',
  titlePrintKey: 'press-agenda-pdf-name',
  routeModel: 'print-overviews.press-agenda'
});
