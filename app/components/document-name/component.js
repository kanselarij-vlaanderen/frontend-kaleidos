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
		const { documentVersion } = this;

		const version = await this.versionNames.createVersionName(documentVersion.get('versionNumber'));

		let title = await documentVersion.get('document.numberVr') + version;
		if (title !== "undefined") {
			return title;
		} else {
			return await this.get('fallbackDocumentName');
		}
	})
});
