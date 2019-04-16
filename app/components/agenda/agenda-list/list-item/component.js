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

	agenda: computed('agendaitem', function() {
		return this.get('agendaitem.agenda.name');
	}),

	documents: computed('agendaitem.documentVersions.@each', function() {
		return this.get('agendaitem.documents');
	}),

	filteredDocumentVersions: computed('documents.@each', async function() {
		const documents = await this.get('documents');
		return Promise.all((documents).map(async (document) => {
			return await document.getDocumentVersionsOfItem(this.get('agendaitem'));
		}))
	}),

	lastVersions: computed('filteredDocumentVersions.@each', async function() {
		const filteredDocumentVersions = await this.get('filteredDocumentVersions');
		return filteredDocumentVersions.map((documents) => {
			return documents.get('firstObject');
		})
	}),

	click(event) {
		const agendaitem = this.store.peekRecord('agendaitem', this.get('agendaitem').get('id'));
		this.selectAgendaItem(agendaitem);
	},

	number: computed('index', function() {
		if(this.index >=0) {
			return (this.index + 1);
		} 
	}),
});
