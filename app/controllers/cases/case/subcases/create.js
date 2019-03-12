import Controller from '@ember/controller';
import { computed } from '@ember/object';
import $ from 'jquery';
import { notifyPropertyChange } from '@ember/object';

export default Controller.extend({
  uploadedFiles: [],
  nonDigitalDocuments: [],
  selectedMandatees: [],
  themes: [],
  isAddingNonDigitalDocument: false,

  title: computed('model', function () {
    return this.get('model').title;
  }),

  shortTitle: computed('model', function () {
    return this.get('model').shortTitle;
  }),

  clearProperties() {
    this.set('uploadedFiles', []);
    this.set('nonDigitalDocuments', []);
    this.set('selectedMandatees', []);
    this.set('title', undefined);
    this.set('shortTitle', undefined);
    this.set('isAddingNonDigitalDocument', false);
  },

  actions: {
    async createSubCase(event) {
      event.preventDefault();
      const { title, shortTitle } = this;
      const caze = this.store.peekRecord('case', this.model.id);
      const subcase = await this.store.createRecord('subcase', 
      { 
        title, 
        shortTitle, 
        showAsRemark: false, 
        case: caze, 
        created: new Date(), 
        mandatees: this.get('selectedMandatees'),
        themes:this.get('themes')
      });

      const createdSubCase = await subcase.save();
      const uploadedFiles = this.get('uploadedFiles');

      Promise.all(uploadedFiles.map(uploadedFile => {
        if(uploadedFile.id) {
          return this.createNewDocumentWithDocumentVersion(createdSubCase, uploadedFile, uploadedFile.get('name'));
        }
      }));
      const nonDigitalDocuments = this.get('nonDigitalDocuments');

      Promise.all(nonDigitalDocuments.map(nonDigitalDocument => {
        if(nonDigitalDocument.title) {
          return this.createNewDocumentWithDocumentVersion(createdSubCase, null, nonDigitalDocument.title);
        }
      }));

      this.clearProperties();
      this.transitionToRoute('cases.case.subcases')
    },

    chooseType(type) {
      this.set('selectedType', type);
    },

    chooseTheme(themes){
      this.set('themes', themes);
    },

    selectMandatees(mandatees) {
      this.set('selectedMandatees', mandatees);
    },

    uploadedFile(uploadedFile) {
      uploadedFile.set('public', true);
      this.get('uploadedFiles').pushObject(uploadedFile);
    },


    chooseDocumentType(uploadedFile, type) {
      uploadedFile.set('documentType', type.name || type.description);
    },

    removeFile(file) {
      $.ajax({
        method: "DELETE",
        url: '/files/' + file.id
      })
      this.get('uploadedFiles').removeObject(file);
    },

    removeDocument(document) {
      this.get('nonDigitalDocuments').removeObject(document);
    },

    createNonDigitalDocument() {
      this.nonDigitalDocuments.push({title: this.get('documentTitle')});
      notifyPropertyChange(this, 'nonDigitalDocuments');
      this.set('documentTitle', null);
    },
  
    toggleAddNonDigitalDocument() {
      this.toggleProperty('isAddingNonDigitalDocument')
    }
  },

  async createNewDocumentWithDocumentVersion(subcase, file, documentTitle) {
    let document = await this.store.createRecord('document', {
      created: new Date(),
      title: documentTitle
      // documentType: file.get('documentType')
    });
    document.save().then(async(createdDocument) => {
      if(file) {
        delete file.public;
        const documentVersion = await this.store.createRecord('document-version', {
          document: createdDocument,
          subcase: subcase,
          created: new Date(),
          versionNumber: 1,
          file:file,
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
  }
});
