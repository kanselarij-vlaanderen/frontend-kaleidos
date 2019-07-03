import Service from '@ember/service';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import EmberObject from '@ember/object';

export default Service.extend({
	intl: inject(),
	messages: [],
	type: 'error',
	shouldUndoChanges: false,

	showToast: task(function* (messageToAdd) {
		const messageTypeAlreadyFound = this.messages.find((item) => item.get('type') === messageToAdd.get('type'));
		if (messageTypeAlreadyFound) {
			return;
		}
		if (this.messages.get('length') >= 3) {
			const firstObject = this.messages.get('firstObject');
			this.messages.removeObject(firstObject);
		}
		this.messages.addObject(messageToAdd);
		switch (messageToAdd.type) {
			case 'error':
				yield timeout(3000);
				break;
			case 'success':
				yield timeout(2000);
				break;
			case 'warning-undo':
				yield timeout(15000);
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
