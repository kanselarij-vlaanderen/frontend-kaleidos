import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
	tagName:'div',
	classNames: ['vl-u-spacer'],
	store: inject(),

	searchTask: task(function* (searchValue) {
		yield timeout(300);
		return this.store.query('subcase', {
			filter: {
				title: `${searchValue}`
			}
		});
	}),

	actions: {
		chooseItem(agendaItem) {
			this.chooseItem(agendaItem);
		},

		resetValue(param) {
			if (param == "") {
				this.set('subcases',  this.store.query('subcase',{ query: {
				}}));
			}
		},
		navigateToSubCases() {
			this.set('addingAgendaItems', true);
			this.navigateToSubCases();
		},
    navigateToCreateAnnouncement() {
			this.set('addingAnnouncement', true);
			this.navigateToCreateAnnouncement();
		}
	}
});
