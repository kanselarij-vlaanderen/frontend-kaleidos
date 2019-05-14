import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';

export default Mixin.create({
	store: inject(),

	updateModifiedProperty(model) {
		model.set('modified', new Date());
		return model.save();
	}
});
