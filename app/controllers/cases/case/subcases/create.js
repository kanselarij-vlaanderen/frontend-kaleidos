import Controller from '@ember/controller';
import { computed } from '@ember/object';
import $ from 'jquery';

export default Controller.extend({
  uploadedFiles: [],
  nonDigitalDocuments: [],
  selectedMandatees: [],
  isAddingNonDigitalDocument: false,
  part: 1,
  isPartOne: computed('part', function () {
    return this.get('part') === 1;
  }),
  title: computed('model', function () {
    return this.get('model').title;
  }),
  shortTitle: computed('model', function () {
    return this.get('model').shortTitle;
  }),
  selectedThemes: computed('model', function () {
    return this.get('model').themes;
  }),
  status: computed('model', function () {
    return this.get('model').status;
  }),
  selectedType: computed('model', function () {
    return this.get('model').type;
  }),
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
        mandatees: this.get('selectedMandatees')
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

      this.set('uploadedFiles', []);
      this.set('nonDigitalDocuments', []);
      this.set('selectedMandatees', []);
      this.transitionToRoute('cases.case.subcases.overview')
    },
    nextStep() {
      this.set('part', 2);
    },
    previousStep() {
      this.set('part', 1);
    },
    chooseTheme(theme) {
      this.set('selectedThemes', theme);
    },
    chooseType(type) {
      this.set('selectedType', type);
    },
    titleChange(title) {
      this.set('title', title);
    },
    shortTitleChange(shortTitle) {
      this.set('shortTitle', shortTitle);
    },
    statusChange(status) {
      this.set('status', status);
    },
    uploadedFile(uploadedFile) {
      uploadedFile.set('public', true);
      this.get('uploadedFiles').pushObject(uploadedFile);
    },
    selectMandatees(mandatees) {
      this.set('selectedMandatees', mandatees);
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
      this.notifyPropertyChange('nonDigitalDocuments');
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
