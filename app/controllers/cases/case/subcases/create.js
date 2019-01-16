import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  part: 1,
  isPartOne : computed('part', function() {
    return this.get('part') === 1;
  }),
  title : computed('model', function() {
    return this.get('model').title;
  }),
  shortTitle : computed('model', function() {
    return this.get('model').shortTitle;
  }),
  selectedThemes : computed('model', function() {
    return this.get('model').themes;
  }),
  status : computed('model', function() {
    return this.get('model').status;
  }),
  selectedType : computed('model', function() {
    return this.get('model').type;
  }),
  actions: {
    async createSubCase(event) {
      event.preventDefault();
      const { title, shortTitle, remark, isPublic } = this;
      const caze = this.store.peekRecord('case', this.model.id);
      let subcase = await this.store.createRecord('subcase', {  title, shortTitle, remark, case: caze, created: new Date(), public: isPublic });

      const createdSubCase = await subcase.save();
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
    }
  }
});
