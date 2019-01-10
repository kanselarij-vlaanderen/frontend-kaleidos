import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    async createDossier(event) {
      event.preventDefault();
      const { title, shortTitle, remark, themes } = this;
      let cases = this.store.createRecord('case', {  title, shortTitle, remark, themes });
      await cases.save();
      await this.transitionToRoute('cases');
    }
  }
});
