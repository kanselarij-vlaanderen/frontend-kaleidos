import Route from '@ember/routing/route';

export default class CaseRoute extends Route {
  async model() {
    return this.modelFor('publications.publication');
  }

  async afterModel(model) {
    this.subcase = await this.store.queryOne('subcase', {
      filter: {
        case: {
          [':id:']: model.id,
        },
        ':has:agenda-activities': 'yes',
      },
      sort: '-created',
    });

    // TODO This is not ideal, there are currently +- 60 organizations that come from ACM-IDM, they don't have a name
    // TODO need a better filter, add a boolean to model maybe ?
    const organizationsPromise = this.store.query('organization', {
      page: {
        size: 200,
      },
    }).then((organizations) => organizations.filter((org) => org.name));

    this.organizations = await organizationsPromise;
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.subcase = this.subcase;
    controller.organizations = this.organizations;
  }
}
