import Component from '@ember/component';
import moment from 'moment';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  document: null,
  agendaitem: null,

  tagName: "p",
  
  versionNames: inject(),
  store: inject(),
  
  documentName: computed('document.lastDocumentVersion', 'agendaitem', async function(){
		if(!this.agendaitem){
      let last = await this.document.get('lastDocumentVersion')
      return last.get('nameToDisplay');
		}
		let subcase = await this.agendaitem.get('subcase');
		let promises = await RSVP.hash({
			voCase: subcase.get('case'),
			agenda: this.agendaitem.get('agenda')
		});
		let agenda = promises.agenda;
		let meeting = await agenda.get('createdFor')
		
		let identifier = await this.store.query('document-vo-identifier', {
			filter: {
				subcase: {
					id: subcase.get('id')
				},
				meeting: {
					id: meeting.get('id')
				},
				"document-version": {
					id: this.document.lastDocumentVersion.get('id')
				}
			}
		});
		identifier = identifier.objectAt(0);
		let title = identifier.get('title');
		if(title){
			return title;
		}
		let paddedAgendaNumber = (""+this.agendaitem.priority);
		while(paddedAgendaNumber.length < 4){
			paddedAgendaNumber = `0${paddedAgendaNumber}`;
		}
		// TODO when case can be accouncement, fix hardcoded DOC
		// TODO fix agendaitem number
		let version = this.versionNames.createVersionName(identifier.versionNumber);
		title = `VR ${moment(meeting.plannedStart).format("YYYY MMDD")} DOC.${meeting.get("number")}/${paddedAgendaNumber}/${identifier.serialNumber}`;
		if(version.length > 0){
			title += ` ${version}`;
		}
		return title;
	}),

});
