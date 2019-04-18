import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Mixin.create({
	currentSession: inject(),
	store:inject(),
	isAdmin: alias('currentSession.isAdmin')
});
