import Component from '@ember/component';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import $ from 'jquery';
import { inject } from '@ember/service';
import moment from 'moment';
import RSVP from 'rsvp';
import { computed } from '@ember/object';

export default Component.extend(FileSaverMixin,{
	classNames:["vl-u-spacer"],
	isShowingVersions: false,
	store: inject(),
	versionNames: inject(),
	isUploadingNewVersion: false,
  uploadedFile: null,
	fileName: null,

	documentNameToDisplay: computed('document.lastDocumentVersion', 'agendaitem', 'subcase', async function(){
		if(!this.agendaitem || !this.subcase){
			return null;
		}
		let subcase = this.subcase;
		let promises = await RSVP.hash({
			voCase: subcase.get('case'),
			agenda: this.agendaitem.get('agenda')
		});
		let voCase = promises.case;
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

	actions: {
		showVersions() {
			this.toggleProperty('isShowingVersions');
		},

		async uploadNewVersion() {
			const document = await this.get('document');
			const newVersion = await document.get('lastDocumentVersion');
      const file = this.get('uploadedFile');
      let newDocumentVersion = this.store.createRecord('document-version',
        {
          file: file,
          versionNumber: newVersion.get('versionNumber') + 1,
          document: document,
          chosenFileName: this.get('fileName') || file.fileName || file.name,
          created: new Date()
        });
      await newDocumentVersion.save();
      this.set('uploadedFile', null);
      this.set('fileName', null);
      this.set('isUploadingNewVersion', false);
			document.hasMany('documentVersions').reload();
			document.notifyPropertyChange('documentVersions');
			if(this.get('subcase')) {
			  this.get('subcase').notifyPropertyChange('documents');
			}
		},
		
		async downloadFile(documentVersion) {
			let file = await documentVersion.get('file');
				$.ajax(`/files/${file.id}?download=${file.filename}`, {
					method: 'GET',
					dataType: 'arraybuffer', // or 'blob'
					processData: false
				})
				.then((content) => this.saveFileAs(documentVersion.nameToDisplay, content, this.get('contentType')));
		},
		
		async openUploadDialog() {
      const uploadedFile = this.get('uploadedFile');
      if (uploadedFile && uploadedFile.id) {
        this.deleteFile(uploadedFile.id);
      }
      this.toggleProperty('isUploadingNewVersion');
		},

		async createNewDocumentWithDocumentVersion(subcase, file, documentTitle) {
			let document = await this.store.createRecord('document', {
				created: new Date(),
				title: documentTitle
				// documentType: file.get('documentType')
			});
			document.save().then(async (createdDocument) => {
				if (file) {
					delete file.public;
					const documentVersion = await this.store.createRecord('document-version', {
						document: createdDocument,
						subcase: subcase,
						created: new Date(),
						versionNumber: 1,
						file: file,
						chosenFileName: file.get('name')
					});
					await documentVersion.save();
				} else {
					const documentVersion = await this.store.createRecord('document-version', {
						document: createdDocument,
						subcase: subcase,
						created: new Date(),
						versionNumber: 1,
						chosenFileName: documentTitle
					});
					await documentVersion.save();
				}
			});
		},
		
    async getUploadedFile(file) {
      this.set('fileName', file.filename)
      this.set('uploadedFile', file);
    },

    removeFile() {
      $.ajax({
        method: "DELETE",
        url: '/files/' + this.get('uploadedFile.id')
      });
      this.set('uploadedFile', null);
    }
	}
});
