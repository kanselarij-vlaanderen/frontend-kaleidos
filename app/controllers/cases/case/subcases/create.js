import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  uploadedFile: null,
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
      const { title, shortTitle, remark, isPublic } = this;
      const caze = this.store.peekRecord('case', this.model.id);
      let subcase = await this.store.createRecord('subcase', { title, shortTitle, remark, case: caze, created: new Date(), public: isPublic });

      let createdSubCase = await subcase.save();
      let documentVersion = this.store.createRecord('document-version', {
        subcase: createdSubCase,
        file: this.get('uploadedFile'),
        versionNumber: 1
      });
      await documentVersion.save();
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
      this.set('uploadedFile', uploadedFile);
    }
  }
});
