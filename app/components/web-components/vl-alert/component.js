import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	classNames:['vl-alert'],
	classNamesBindings: ['getClassNames'],

	getClassNames: computed('small', function() {
		if(this.get('small')) {
			return "vl-alert--small";
		}
	})
});
