import Controller from '@ember/controller';

export default Controller.extend({
  actions : {
    addAgenda: () => {
      const title = this.get('title');
      alert (title);
    }
  }
});
