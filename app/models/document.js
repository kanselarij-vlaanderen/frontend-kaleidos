import DS from 'ember-data';
import { computed } from '@ember/object';
import RSVP from 'rsvp';

const { Model, attr, hasMany, belongsTo } = DS;

export default Model.extend({
	created: attr('date'),
	title: attr('string'),
	numberVp: attr('string'),
	numberVr: attr('string'),
	documentVersions: hasMany('document-version', { inverse: null }),
	remarks: hasMany('remark'),

	decision: belongsTo('decision'),
	type: belongsTo('document-type'),
	confidentiality: belongsTo('confidentiality'),

	createNextAgendaVersionIdentifier: async function (agendaitem, nextVersion) {
		let currentIdentifier = await this.getDocumentIdentifierForVersion(agendaitem);
		if (!currentIdentifier) {
			return null;
		}
		let newIdentifier = this.store.createRecord('document-vo-identifier', {
			subcase: await currentIdentifier.get('subcase'),
			meeting: await currentIdentifier.get('meeting'),
			documentVersion: nextVersion,
			serialNumber: currentIdentifier.get('serialNumber'),
			versionNumber: currentIdentifier.get('versionNumber') + 1
		});
		await newIdentifier.save();
		return newIdentifier;
	},

	getDocumentIdentifierForVersion: async function (agendaitem) {
		let subcase = await agendaitem.get('subcase');
		let promises = await RSVP.hash({
			voCase: subcase.get('case'),
			agenda: agendaitem.get('agenda')
		});
		let agenda = promises.agenda;
		let meeting = await agenda.get('createdFor');
		let lastDocumentVersion = await this.get('lastDocumentVersion');
		let identifier = await this.store.query('document-vo-identifier', {
			filter: {
				subcase: {
					id: subcase.get('id')
				},
				meeting: {
					id: meeting.get('id')
				},
				"document-version": {
					id: lastDocumentVersion.get('id')
				}
			}
		});
		identifier = identifier.objectAt(0);
		return identifier;
	},

	sortedDocuments: computed('documentVersions', function () {
		return this.get('documentVersions').then(versions => {
			return versions.sortBy('versionNumber');
		});
	}),

	lastDocumentVersion: computed('sortedDocuments', async function () {
		return (await this.get('sortedDocuments')).get('lastObject');
	})
});
