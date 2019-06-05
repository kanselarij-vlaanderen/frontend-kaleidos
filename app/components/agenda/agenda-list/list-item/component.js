import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { on } from '@ember/object/evented';

export default Component.extend({
	store: inject(),
	sessionService: inject(),
	classNameBindings: ["extraAgendaItemClass"],
	tagName: 'a',
	selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
	isClickable: true,

<<<<<<< Updated upstream
	extraAgendaItemClassObserver: on('init', observer('agendaitem', 'selectedAgendaItem', 'isClickable', 'id', async function () {
		let clazz = '';

		if (this.get('agendaitem.id') && (this.get('agendaitem.id') == this.get('selectedAgendaItem.id'))) {
=======
	extraAgendaItemClassObserver: on('init', observer('agendaitem', 'selectedAgendaItem', 'id', 'isClickable', async function () {
		let clazz = '';
		if (this.get('id') == this.get('selectedAgendaItem.id')) {
>>>>>>> Stashed changes
			clazz += 'vlc-agenda-items-new__sub-item--active ';
		}

		if (!this.get('isClickable')) {
			clazz += ' not-clickable '
		}
		const postponed = (await this.get('agendaitem.postponedTo'));
		const retracted = this.get('agendaitem.retracted');

		if ((postponed || retracted)) {
			clazz += ' transparant';
		}
		if (!this.get('isDestroyed')) {
			this.set('extraAgendaItemClass', clazz);
		}
	})),

	agendaitem: computed('id', function () {
		return this.store.findRecord('agendaitem', this.get('id'));
	}),

	agenda: computed('agendaitem', function () {
		return this.get('agendaitem.agenda.name');
	}),

	documents: computed('agendaitem.documentVersions.@each', function () {
		if (this.get('selectedAgendaItem')) {
			return;
		}
		return this.get('agendaitem.documents');
	}),

	async click() {
		const agendaitem = await this.store.findRecord('agendaitem', this.get('id'));
		this.selectAgendaItem(agendaitem);
	}
});
