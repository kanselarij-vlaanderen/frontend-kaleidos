import Route from '@ember/routing/route';

export default class PublicationDocumentsRoute extends Route {
  async model() {
    const parentHash = this.modelFor('publications.publication');
    const _case = parentHash.case;
    const piecesData = this.store.query('piece', {
      include: 'cases,document-container,document-container.type',
      reload: true,
      filter: {
        cases: {
          id: _case.get('id'),
        },
      },
    });

    const model = {
      case: _case,
      pieces: (await piecesData).toArray(),
    };

    return model;
  }

  /* eslint-disable id-length,no-unused-vars */
  resetController(controller, _, transition) {
    controller.reset();
  }
}
