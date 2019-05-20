import Route from '@ember/routing/route';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import CONFIG from 'fe-redpencil/utils/config';

export default Route.extend(DataTableRouteMixin, {
  modelName: "case",

  queryParams: {
    oc: {
      refreshModel: true
    }
  },

  mergeQueryOptions(params) {
    let filter = {};
    let oc = params.oc;

    if (oc === "true") {
      filter["policy-level"] = { id: CONFIG.OCCaseTypeID };
    } else {
      filter["policy-level"] = { id: CONFIG.VRCaseTypeID };
    }
    return {
      // include: 'subcases',
      filter: filter
      // filter: { 'is-archived': params.filter }
    };
  },

  actions: {
    refreshModel() {
      this.refresh();
    }
  }
});
