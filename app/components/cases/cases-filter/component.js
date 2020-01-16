import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import moment from 'moment';

export default Component.extend({
	classNames:["vl-form vl-u-spacer-extended-bottom-l vlc-box"],
	searchText: null,
  disableAdvanced: false,
	ministerName: null,
	dateFrom: undefined,
	dateTo: undefined,
	searchInDecisionsOnly: false,

	init() {
		this._super(...arguments);
		if(this.dateFrom){
			this.set('dateFrom', moment(this.dateFrom).toDate());
		}
		if(this.dateTo){
			this.set('dateTo', moment(this.dateTo).toDate());
		}
	},

	searchTask: task(function* () {
		yield timeout(600);
		this.filter({
			searchText: this.searchText,
			mandatees: this.ministerName,
			dateFrom: this.dateFrom && moment(this.dateFrom).utc().format(),
			dateTo: this.dateTo && moment(this.dateTo).utc().format(),
			searchInDecisionsOnly: this.searchInDecisionsOnly
		});
	}).restartable(),

	actions: {
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
