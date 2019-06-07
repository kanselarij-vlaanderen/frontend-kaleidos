import Controller from '@ember/controller';
import PrintOverviewMixin from 'fe-redpencil/mixins/print-overview-mixin';

export default Controller.extend(PrintOverviewMixin, {
	titleTranslationKey: 'agenda-notes',
	titlePrintKey: 'agenda-notes',
	routeModel: 'print-overviews.decisions.agendaitems',
});
