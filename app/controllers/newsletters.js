import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {
	intl: inject(),
	sessionService: inject(),

	sort: '-planned-start',
	isAdding: false,
	isEditing: false,
	currentSession: alias('sessionService.currentSession'),

	editTitle: computed('selectedMeeting', function () {
		const date = this.get('selectedMeeting.plannedStart');
		return `${this.get('intl').t('newsletter-of')} ${moment(date).format('dddd DD-MM-YYYY')}`;
	}),

	translatedPrefix: computed('intl', function () {
		return this.get('intl').t('newsletter-for-meeting-of');
	}),

	emptyValue: computed('intl', function () {
		return this.get('intl').t('dash');
	}),

	actions: {
		navigateToNewsLetter(meeting) {
			const { currentSession } = this;
			this.set('sessionService.currentSession', currentSession);
			this.transitionToRoute('newsletters-overview', meeting.get('id'));
		},

		addNewsletterToMeeting(meeting) {
			this.set('selectedMeeting', meeting);
			this.toggleProperty('isAdding');
		},

		editNewsletterOfMeeting(meeting) {
			this.set('selectedMeeting', meeting);
			this.toggleProperty('isEditing');
		},

		close() {
			this.set('isAdding', false);
			this.set('isEditing', false);
		}
	}
});
