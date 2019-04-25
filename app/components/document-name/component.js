import Component from '@ember/component';
import moment from 'moment';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend(EditAgendaitemOrSubcase, {
	item: null,
	documentVersion: null,

	tagName: "p",
	versionNames: inject(),

	fallbackDocumentName: computed('documentVersion.nameToDisplay', function () {
		return this.get('documentVersion.nameToDisplay');
	}),

	documentName: computed('documentVersion', 'fallbackDocumentName', 'item', async function () {
		const { item, documentVersion } = this;
		if (!this.get('isAgendaItem') || !documentVersion) {
			return await this.get('fallbackDocumentName');
		}
		const subcase = await item.get('subcase');
		const numberInSubcase = await subcase.documentNumberOfVersion(documentVersion);

		let paddedAgendaNumber = ("" + item.get('priority'));
		while (paddedAgendaNumber.length < 4) {
			paddedAgendaNumber = `0${paddedAgendaNumber}`;
		}
		// TODO when case can be accouncement, fix hardcoded DOC
		// TODO fix agendaitem number
		const version = await this.versionNames.createVersionName(documentVersion.get('versionNumber'));
		const meeting = await item.get('agenda.createdFor');
		let title = `VR ${moment(meeting.get('plannedStart')).format("YYYY MMDD")}DOC.FIXME/${numberInSubcase}`;
		if (version.length > 0) {
			title += ` ${version}`;
		}
		return title;
	}),

});
