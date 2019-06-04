import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import { EditAgendaitemOrSubcase } from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';

export default Component.extend(EditAgendaitemOrSubcase, {
	item: null,
	documentVersion: null,

	tagName: "p",
	versionNames: inject(),

	fallbackDocumentName: computed('documentVersion.nameToDisplay', async function () {
		return await this.get('documentVersion.nameToDisplay');
	}),

	documentName: computed('documentVersion', 'fallbackDocumentName', 'item', async function () {
		const documentVersion = await this.get('documentVersion');
		const version = await this.versionNames.createVersionName(documentVersion.get('versionNumber'));

		let title = await documentVersion.get('document.numberVr') + version;
		if (await documentVersion.get('document.numberVr') !== "undefined") {
			if (title !== "undefined") {
				return title;
			}
		}
		return await this.get('fallbackDocumentName');
	})
});
