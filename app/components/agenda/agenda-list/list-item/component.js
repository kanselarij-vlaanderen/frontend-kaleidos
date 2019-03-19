import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
	store:inject(),
	classNames: ["vlc-agenda-item"],
	classNameBindings: ["getClassNames"],
	tagName: 'a',
	index:null,

	getClassNames: computed('agendaitem', 'selectedAgendaItem', function() {
		if(this.get('agendaitem.id') == this.get('selectedAgendaItem.id')) {
			return 'vlc-agenda-item--active';
		}
	}),

	click(event) {
		const agendaitem = this.store.peekRecord('agendaitem', this.get('agendaitem').get('id'))
		this.selectAgendaItem(agendaitem);
	},

	number: computed('index', function() {
		if(this.index >=0) {
			return (this.index + 1);
		} 
	})
});
