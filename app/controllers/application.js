import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
	
	type: computed('model', async function() {
		const { model } = this;
		if(model) {
			const type = await model.get('type.label');
			if (type === 'Waarschuwing') {
				return 'vl-alert--warning';
			} else if (type === 'Dringend') {
				return 'vl-alert--error';
			}
		}
		return '';
	}),

	actions: {
		close() {
			this.set('model', null);
		}
	}
});
