import Controller from '@ember/controller';
import PrintOverviewMixin from 'fe-redpencil/mixins/print-overview-mixin';

export default Controller.extend(PrintOverviewMixin, {
	titleTranslationKey: 'decisions-of',
	titlePrintKey: 'decisions-pdf-name',
	routeModel: 'print-overviews.decisions'
});
