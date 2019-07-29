import Component from '@ember/component';
import { inject } from '@ember/service';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
	classNames: ['vlc-scroll-wrapper__header'],
	store: inject(),

	searchTask: task(function* () {
		yield timeout(600);
		this.search(this.get('value'));
	}).restartable(),

	actions: {
		search(){
			this.searchTask.perform();
		}
	}
});
