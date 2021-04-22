import Route from '@ember/routing/route';

export default class PublicationDocumentsRoute extends Route {
  async model() {
    const parentHash = this.modelFor('publications.publication');
    const _case = parentHash.case;
    const modelData = await this.store.query('piece', {
      include: 'cases,document-container,document-container.type',
      reload: true,
      filter: {
        cases: {
          id: _case.get('id'),
        },
      },
    });
    return modelData.toArray();
  }

  async afterModel() {
    const parentHash = this.modelFor('publications.publication');
    this.case = parentHash.case;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.setup({
      _case: this.case,
    });
  }

  resetController(controller) {
    controller.reset();
  }
}
