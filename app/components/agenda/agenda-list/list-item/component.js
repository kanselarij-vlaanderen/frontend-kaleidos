import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

export default Component.extend({
	store:inject(),
	sessionService:inject(),
	classNames: ["vlc-agenda-items-new__sub-item"],
	classNameBindings: ["getClassNames"],
	tagName: 'a',
	index:null,
	selectedAgendaItem: alias('sessionService.selectedAgendaItem'),

	getClassNames: computed('agendaitem', 'selectedAgendaItem', function() {
		if(this.get('agendaitem.id') == this.get('selectedAgendaItem.id')) {
			return 'vlc-agenda-items-new__sub-item--active';
		}
	}),

	click(event) {
		const agendaitem = this.store.peekRecord('agendaitem', this.get('agendaitem').get('id'));
		this.selectAgendaItem(agendaitem);
	},

	number: computed('index', function() {
		if(this.index >=0) {
			return (this.index + 1);
		} 
	})
});
