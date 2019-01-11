import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    async createSubCase(event) {
      event.preventDefault();
      const { title, shortTitle, remark } = this;
      let cases = this.store.createRecord('subcase', {  title, shortTitle, remark, case: this.model });
      await cases.save();
      await this.transitionToRoute('cases.case.subcases.overview');
    }
  }
});
