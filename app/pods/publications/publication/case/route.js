import Route from '@ember/routing/route';

export default class CaseRoute extends Route {
  async model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    const isViaCouncilOfMinisters = this.store.queryOne('subcase', {
      filter: {
        case: {
          [':id:']: model.case.get('id'),
        },
        ':has:agenda-activities': 'yes',
      },
    }).then((subcase) => !!subcase);

    // TODO This is not ideal, there are currently +- 60 organizations that come from ACM-IDM, they don't have a name
    // TODO need a better filter, add a boolean to model maybe ?
    const organizationsPromise = this.store.query('organization', {
      page: {
        size: 200,
      },
    }).then((organizations) => organizations.filter((org) => org.name));

    this.isViaCouncilOfMinisters = await isViaCouncilOfMinisters;
    this.organizations = await organizationsPromise;
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
    controller.organizations = this.organizations;
  }
}
