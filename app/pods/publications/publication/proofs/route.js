import Route from '@ember/routing/route';

export default class PublicationsPublicationProofsRoute extends Route {
  modelPublication() {
    return this.modelFor('publications.publication').publicationSubcase;
  }

  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    const case_ = await model.case;
    const subcase = await this.store.queryOne('subcase', {
      filter: {
        case: {
          [':id:']: case_.id,
        },
        ':has:agenda-activities': 'yes',
      },
    });
    this.isViaCouncilOfMinisters = !!subcase;
  }
}
