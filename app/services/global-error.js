import Service from '@ember/service';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import EmberObject from '@ember/object';

export default Service.extend({
	intl: inject(),
	messages: [],
	type: 'error',

	showToast: task(function* (messageToAdd) {
		if(this.messages.get('length') >= 3) {
			const firstObject = this.messages.get('firstObject');
			this.messages.removeObject(firstObject);
		}
		this.messages.addObject(messageToAdd);
		switch (messageToAdd.type) {
			case 'error':
				yield timeout(3000);
				break;
			case 'success':
				yield timeout(1000);
				break;
		}
		this.messages.removeObject(messageToAdd);
	}),

	handleError() {
		this.showToast.perform(EmberObject.create({
			title: this.intl.t('warning-title'),
			message: this.intl.t('error'),
			type: this.type
		}))
	}
});
