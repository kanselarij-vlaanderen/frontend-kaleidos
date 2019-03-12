import Component from '@ember/component';
import { inject } from '@ember/service';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Component.extend(DefaultQueryParamsMixin, {
  subcasesService: inject(),
  store: inject(),
  actions: {
    selectAllSubCases(subcases) {
      //this.typeChanged(type);
    },
    selectPostponedSubcase(subcase) {
      this.selectSubcase(subcase);
    }
  },
  async didInsertElement() {
    this._super(...arguments);
    const ids = await this.get('subcasesService').getPostPonedSubcaseIds();
    const subcases = await this.store.query('subcase', {
      filter: {
        "id": ids.toString()

      }
    });
    this.set('subcases', subcases);
  }
});
