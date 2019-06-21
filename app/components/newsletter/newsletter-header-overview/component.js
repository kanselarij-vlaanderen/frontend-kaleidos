import Component from '@ember/component';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import moment from 'moment';
import { inject } from '@ember/service'
import { computed } from '@ember/object';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ["vlc-page-header", 'vl-u-bg-alt'],
	session: inject(),
	routing: inject('-routing'),
	sessionService: inject(),
	agendaService: inject(),
	intl: inject(),

	shouldShowPrintButton: computed('routing.currentRouteName', function () {
		return this.routing.get('currentRouteName').includes(`newsletter.overview`);
	}),

	actions: {
		print() {
			var tempTitle = window.document.title;
			window.document.title = `${this.get('intl').t('newsletter-overview-pdf-name')}${moment(this.get('sessionService.currentSession.plannenStart')).utc().format('YYYYMMDD')}`;
			window.print();
			window.document.title = tempTitle;
		},

		async sendNewsletter() {
			const agenda = await this.get('agenda');
			this.get('agendaService').sendNewsletter(agenda);
		}
	}
});
