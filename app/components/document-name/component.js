import Component from '@ember/component';
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
		const documentVersion = await this.get('documentVersion');
		const versionNumber = await documentVersion.get('versionNumber');
		const version = await this.versionNames.createVersionName(versionNumber);
		let documentNumberVr = await documentVersion.get('document.numberVr');

		if (documentNumberVr && documentNumberVr != "undefined") {
			let title = documentNumberVr + version;
			if (title != "undefined") {
				return title;
			}
		}
		return this.get('fallbackDocumentName');
	})
});
