import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import moment from 'moment';

export default Mixin.create({
	store: inject(),

	updateModifiedProperty(model) {
		model.set('modified', moment().utc().toDate());
		return model.save();
	}
});
