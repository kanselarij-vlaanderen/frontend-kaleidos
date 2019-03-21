import Component from '@ember/component';
import moment from 'moment';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  document: null,
  agendaitem: null,

  tagName: "p",
  
  versionNames: inject(),
  store: inject(),

  fallbackDocumentName: computed('document.lastDocumentVersion', async function(){
    let last = await this.document.get('lastDocumentVersion')
    return last && last.get('nameToDisplay');
  }),
  
  documentName: computed('document', 'fallbackDocumentName', 'agendaitem', async function(){
		if(!this.agendaitem){
      return this.get('fallbackDocumentName');
		}
		let lastDocumentVersion = await this.document.get('lastDocumentVersion');
    if(!lastDocumentVersion){
      return "";
    }
    let identifier = await this.document.getDocumentIdentifierForVersion(this.agendaitem);
		if(!identifier){
      return this.get('fallbackDocumentName');
    }
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
    let meeting = await identifier.get('meeting');
		title = `VR ${moment(meeting.plannedStart).format("YYYY MMDD")} DOC.${meeting.get("number")}/${paddedAgendaNumber}/${identifier.serialNumber}`;
		if(version.length > 0){
			title += ` ${version}`;
		}
		return title;
	}),

});
