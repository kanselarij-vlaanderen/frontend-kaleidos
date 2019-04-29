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

	fallbackDocumentName: computed('documentVersion.nameToDisplay', async function () {
		return this.get('documentVersion.nameToDisplay');
	})

});
