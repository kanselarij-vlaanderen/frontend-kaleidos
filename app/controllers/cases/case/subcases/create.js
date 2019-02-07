import Controller from '@ember/controller';
import { computed } from '@ember/object';
import $ from 'jquery';

export default Controller.extend({
  uploadedFiles: [],
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
      const { title, shortTitle, remark, confidential } = this;
      const caze = this.store.peekRecord('case', this.model.id);
      const date = new Date();
      let subcase = await this.store.createRecord('subcase', { title, shortTitle, remark, case: caze, created: date, modified: date, confidential });

      let createdSubCase = await subcase.save();
      let uploadedFiles = this.get('uploadedFiles');

      Promise.all(uploadedFiles.map(uploadedFile => {
        if(uploadedFile.id) {
          return this.createNewDocumentWithDocumentVersion(createdSubCase, uploadedFile);
        }
      }));

      await caze.get('subcases').pushObject(createdSubCase);

      caze.save();
      this.transitionToRoute('cases.case.subcases.overview');
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

    removeFile(file) {
      $.ajax({
        method: "DELETE",
        url: '/files/' + file.id
      }).then(() => {
        this.get('uploadedFiles').removeObject(file);
      })
    }
  },

  async createNewDocumentWithDocumentVersion(subcase, file) {
    let document = await this.store.createRecord('document', {
      subcase: subcase,
      created: new Date(),
      public: file.public
    });
    document.save().then(async(createdDocument) => {
      delete file.public;
      let documentVersion = await this.store.createRecord('document-version', {
        document: createdDocument,
        created: new Date(),
        versionNumber: 1,
        file:file,
        chosenFileName: file.get('name')
      });
      await documentVersion.save();
    });
  }

});
