
import Component from '@ember/component';
import { computed } from '@ember/object';
import moment from 'moment';
import { inject } from '@ember/service';

export default Component.extend({
	classNames:['vl-u-spacer-extended-l'],
	intl: inject(),

	title: computed('currentSession', function() {
		const date = this.get('currentSession.plannedStart');
		return `${this.get('intl').t('print-notes')} ${moment(date).format('dddd DD-MM-YYYY')}`;
	}),
});
