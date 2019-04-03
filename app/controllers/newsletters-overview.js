import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
	page: 1,
	size: 6,

	links: computed('model.links', function () {
		return this.get('model.links')
	}),

	nbOfItems: computed('model.amountShowed', function () {
		return this.get('model.amountShowed');
	}),

	total: computed('model.amountOfItems', function () {
		return this.get('model.amountOfItems');
	})
});
