import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {
	intl: inject(),

	sort: '-planned-start',
	isAdding: false,
	isEditing: false,

	editTitle: computed('selectedMeeting', function () {
		const date = this.get('selectedMeeting.plannedStart');
		return `${this.get('intl').t('newsletter-of')} ${moment(date).utc().format('dddd DD-MM-YYYY')}`;
	}),

	translatedPrefix: computed('intl', function () {
		return this.get('intl').t('newsletter-for-meeting-of');
	}),

	emptyValue: computed('intl', function () {
		return this.get('intl').t('dash');
	}),

  translatedModifiedTitle: computed('intl', function () {
		return this.get('intl').t('latest-modified');
	}),

	actions: {
		async navigateToNewsletter(meeting) {
			const latestAgenda = await meeting.get('latestAgenda')
			this.transitionToRoute("print-overviews.newsletter.agendaitems", meeting.get('id'), latestAgenda.get('id'));
		}
	}
});
