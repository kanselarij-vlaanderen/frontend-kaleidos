import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import { on } from '@ember/object/evented';

export default Component.extend({
	store: inject(),
	sessionService: inject(),
	classNames: [""],
	classNameBindings: ["extraAgendaItemClass"],
	tagName: 'a',
	index: null,
	selectedAgendaItem: alias('sessionService.selectedAgendaItem'),
	isClickable: true,

	extraAgendaItemClassObserver: on('init', observer('agendaitem', 'selectedAgendaItem', 'isClickable', async function () {
		let clazz = '';
		if (this.get('agendaitem.id') == this.get('selectedAgendaItem.id')) {
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

	filteredDocumentVersions: computed('documents.@each', async function () {
		if (this.get('selectedAgendaItem')) {
			return;
		}
		const documents = await this.get('documents');
		return Promise.all((documents).map(async (document) => {
			return await document.getDocumentVersionsOfItem(this.get('agendaitem'));
		}))
	}),

	lastVersions: computed('filteredDocumentVersions.@each', async function () {
		if (this.get('selectedAgendaItem')) {
			return;
		}
		const filteredDocumentVersions = await this.get('filteredDocumentVersions');
		return filteredDocumentVersions.map((documents) => {
			return documents.get('firstObject');
		})
	}),

	phaseToDisplay: computed('agendaitem.subcase.case', async function () {
		const subcase = await this.get('agendaitem.subcase');
		return await subcase.get('case').then(async (caze) => {
			return caze.getPhaseOfSubcaseInCase(subcase).then((phase) => {
				return phase;
			});
		});

	}),

	async click() {
		const agendaitem = await this.store.findRecord('agendaitem', this.get('id'));
		this.selectAgendaItem(agendaitem);
	}
});
