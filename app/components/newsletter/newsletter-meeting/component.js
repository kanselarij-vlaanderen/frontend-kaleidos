import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import moment from 'moment';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	classNames: ['vl-u-spacer-extended-bottom-l', 'vl-col--3-4'],
	isEditing: false,
	intl: inject(),
	store: inject(),

	editTitle: computed('meeting', function () {
		const date = this.get('meeting.plannedStart');
		return `${this.get('intl').t('newsletter-of')} ${moment(date).format('dddd DD-MM-YYYY')}`;
	}),

	actions: {
		async toggleIsEditing() {
			const meeting = await this.get('meeting');
			const newsletter = await meeting.get('newsletter');
			if (!newsletter) {
				const newsletter = this.store.createRecord('newsletter-info', {
					meeting: meeting,
					finished: false,
					publicationDate: new Date(),
					publicationDocDate: new Date(),
				})
				meeting.set('newsletter', newsletter);
				meeting.save();
			}

			this.toggleProperty('isEditing');
		},
		close() {
			this.toggleProperty('isEditing');
		}
	}
});
