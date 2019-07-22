import Route from '@ember/routing/route';

export default Route.extend({
  modelName: "oc-meeting",
  renderTemplate(controller, model) {
    this.render('oc.meetings.new', {
      into: 'oc.meetings',
      controller: 'oc.meetings.new',
      model: this.store.createRecord('oc-meeting', {})
    });
  }
});