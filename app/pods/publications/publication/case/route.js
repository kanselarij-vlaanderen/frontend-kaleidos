import Route from '@ember/routing/route';

export default class CaseRoute extends Route {
  model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    const subcase = await this.store.queryOne('subcase', {
      filter: {
        case: {
          [':id:']: model.case.get('id'),
        },
        ':has:agenda-activities': 'yes',
      },
    });
    this.isViaCouncilOfMinisters = !!subcase;

    // TODO This is not ideal, there are currently +- 60 organizations that come from ACM-IDM, they don't have a name
    // TODO need a better filter, add a boolean to model maybe ?
    const organizations = await this.store.query('organization', {
      page: {
        size: 200,
      },
    });
    this.organizations = organizations.filter((org) => org.name);
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.isViaCouncilOfMinisters = this.isViaCouncilOfMinisters;
    controller.organizations = this.organizations;
  }
}
