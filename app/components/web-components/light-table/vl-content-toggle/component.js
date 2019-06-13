import Component from '@ember/component';
import { computed } from '@ember/object';
export default Component.extend({
	classNames: ["vl-checkbox--switch__wrapper"],
	value: null,
	row: null,
	isLoading: false,

	key: computed('row', 'value', 'column', function () {
		return this.row.content.get('valuePath');
	}),

	actions: {
		async valueChanged(row) {
			const { key } = this;

			this.toggleProperty('isLoading');
			this.toggleProperty('value');
			let itemToUpdate;
			if (key === "forPress") {
				itemToUpdate = row.content;
			} else if (key === "newletterInfo.finished") {
				itemToUpdate = await row.get('newsletterInfo');
			}
			itemToUpdate.set(`${this.key}`, this.value);
			await itemToUpdate.save();
			await row.content.reload();
			this.toggleProperty('isLoading');
		}
	}
});
