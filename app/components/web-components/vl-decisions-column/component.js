import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

	textToShow: computed('row', 'value', 'value.decisions.@each', async function () {
		const subcase = await this.row.get('subcase');
		const approved = await subcase.get('approved');

		if (approved) {
			return `Beslist`;
		} else {
			return `Niet beslist`;
		}
	})
});
