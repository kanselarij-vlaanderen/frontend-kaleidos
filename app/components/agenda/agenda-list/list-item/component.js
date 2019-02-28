import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
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
		this.selectAgendaItem(this.get('agendaitem'));
	},

	number: computed('index', function() {
		if(this.index >=0) {
			return (this.index + 1);
		} 
	})
});
