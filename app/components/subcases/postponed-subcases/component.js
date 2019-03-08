import Component from '@ember/component';
import { inject } from '@ember/service';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Component.extend(DefaultQueryParamsMixin, {
  subcasesService: inject(),
  actions: {
    selectAllSubCases(subcases) {
      //this.typeChanged(type);
    },
    selectPostponedSubcase(subcase) {
      this.selectSubcase(subcase, "postponed");
    }
  },
  async didInsertElement() {
    this._super(...arguments);
    this.set('subcases', await this.get('subcasesService').getPostPonedSubcases());
  }
});
