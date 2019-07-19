import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import moment from 'moment';

export default Component.extend({
	classNames:["vl-form vl-u-spacer-extended-bottom-l"],
	sizeOptions: [5, 10, 20, 50, 100, 200],
	showAdvanced: false,
	size:null,

	searchText: null,
	ministerName: null,
	dateFrom: null,
	dateTo: null,
	searchInDecisionsOnly: false,
	
	searchTask: task(function* () {
		yield timeout(600);
		this.filter({
			searchText: this.searchText,
			mandatees: this.ministerName,
			dateFrom: moment(this.dateFrom).toDate().getTime(),
			dateTo: moment(this.dateTo).toDate().getTime(),
			searchInDecisionsOnly: this.searchInDecisionsOnly
		});
	}).restartable(),

	actions: {
		selectSize(size) {
      this.set('size', size)
		},
		toggleAdvanced() {
			this.toggleProperty('showAdvanced');
		},
		selectDateFrom(date) {
			this.set('dateFrom', date);
			this.searchTask.perform();
		},
		selectDateTo(date) {
			this.set('dateTo', date);
			this.searchTask.perform();
		}
	}
});
