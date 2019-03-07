import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	classNames: ["domains-selector-container"],
	store: inject(),
	selectedDomains: null,

	searchDomain: task(function* (searchValue) {
		yield timeout(300);
		return this.store.query('government-domain', {
			filter: {
				label: searchValue 
			}
		});
	}),

	domains: computed("store", function () {
		return this.store.findAll('government-domain');
	}),

	actions: {
		async chooseDomain(domains) {
			this.set('selectedDomains', domains)
			this.chooseDomain(domains);
		},
		async resetValueIfEmpty(param) {
			if (param === "") {
				this.set('domains', this.store.findAll('government-domain'));
			}
		}
	}
});
