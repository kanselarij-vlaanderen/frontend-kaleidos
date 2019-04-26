import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	classNames: ["vl-form__group vl-u-bg-porcelain"],
	isEditing: false,
	documentsSelected: null,

	finished: computed('agendaitem.newsletterInfo', function() {
		return this.get('agendaitem.newsletterInfo').get('finished');
	}),

	actions: {
		toggleIsEditing() {
			this.toggleProperty('isEditing');
		},
		async selectDocument(documents) {
			this.set('documentsSelected', documents);
		},
		async saveChanges(agendaitem) {
			const newsletterToEdit = await agendaitem.get('newsletterInfo');
			const newsletterToEditDocuments = await newsletterToEdit.get('documents');
			const documents = this.get('documentsSelected');
			if(documents) {
				await Promise.all(documents.map((document) => {
					if (document.get('selected')) {
						newsletterToEdit.get('documents').addObject(document);
						newsletterToEdit.save();
					} else {
						const foundDocument = newsletterToEditDocuments.find((item) => item.get('id') == document.get('id'));
						if (foundDocument) {
							newsletterToEdit.get('documents').removeObject(document);
							newsletterToEdit.save();
						}
					}
				}))
			}
			newsletterToEdit.set('finished', this.get('finished'));
			await newsletterToEdit.save().then((item) => {
				item.hasMany('documents').reload();
				item.reload();
				this.toggleProperty('isEditing');
			});
		},
		async cancelEditing(agendaitem) {
			const newsletter = await agendaitem.get('newsletterInfo');
			newsletter.rollbackAttributes();
			this.toggleProperty('isEditing');
		}
	}
});
