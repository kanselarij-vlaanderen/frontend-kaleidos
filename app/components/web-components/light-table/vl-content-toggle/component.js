import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	newsletterService: inject(),
	classNames: ["vl-checkbox--switch__wrapper"],
	value: null,
	isLoading: false,

	key: computed('row', 'value', 'column', function () {
		return this.column.get('valuePath');
	}),

	actions: {
		async valueChanged(row) {
			const { key } = this;
			this.toggleProperty('isLoading');
			this.toggleProperty('value');

			let itemToUpdate;
			if (key === "forPress") {
				itemToUpdate = row.content;
				itemToUpdate.set(`${this.key}`, (await this.value));
			} else if (key === "subcase.newsletterInfo.inNewsletter") {
				const subcase = await row.content.get('subcase');
				itemToUpdate = await subcase.get('newsletterInfo');
				if (itemToUpdate) {
					itemToUpdate.set(`inNewsletter`, (await this.value));
				} else {
					itemToUpdate = await this.newsletterService.createNewsItemForSubcase(subcase, row, this.value);
				}
			}
			if (itemToUpdate) {
				await itemToUpdate.save();
				await row.content.reload();
			}
			this.toggleProperty('isLoading');
		}
	}
});
