import Service from '@ember/service';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Service.extend({
	intl: inject(),
	messages: null,

	showToast: task(function* (messageToAdd) {
		this.set('messages', [messageToAdd]);
		yield timeout(4000);
		this.set('messages', null);
	}),


});
