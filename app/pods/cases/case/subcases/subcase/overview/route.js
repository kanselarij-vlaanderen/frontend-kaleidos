import Route from '@ember/routing/route';

export default class CasesCaseSubcasesSubcaseOverviewRoute extends Route {
  queryParams = {
    page: {
      refreshModel: true,
      as: 'pagina',
    },
    size: {
      refreshModel: true,
      as: 'aantal',
    },
  };

  async beforeModel() {
    this.case = this.modelFor('cases.case');
  }

  async model(params) {
    const subcase = this.modelFor('cases.case.subcases.subcase');
    const type = await subcase.type;
    // For showing the history of subcases within this route, we need a list of subcases without the current model
    //  We want to sort descending on date the subcase was concluded.
    //  In practice, reverse sorting on created will be close
    const allSubcases = await this.store.query('subcase', {
      filter: {
        case: {
          id: this.case.id,
        },
      },
      page: {
        number: params.page,
        size: params.size,
      },
      sort: '-created',
    });
    const siblingSubcases = allSubcases.filter((sibling) => sibling.id !== subcase.id);
    this.siblingSubcasesCount = allSubcases.meta.count;
    // When we filter, we get a plain JS array instead of the object that has the meta properties,
    // so we need to store this info separately

    return {
      subcase,
      type,
      siblingSubcases,
    }
  }

  async afterModel(model) {
    this.mandatees = (await model.subcase.mandatees).sortBy('priority');
    this.submitter = await model.subcase.requestedBy;
    this.governmentAreas = await this.case.governmentAreas;
  }

  async setupController(controller) {
    super.setupController(...arguments);
    controller.mandatees = this.mandatees;
    controller.submitter = this.submitter;
    controller.case = this.case;
    controller.governmentAreas = this.governmentAreas;
    controller.siblingSubcasesCount = this.siblingSubcasesCount;
  }
}
