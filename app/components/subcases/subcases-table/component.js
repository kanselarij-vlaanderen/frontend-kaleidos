import Component from '@ember/component';

export default Component.extend({
  actions: {
    async selectAllSubCases(subcases) {
      //this.typeChanged(type);
    },
    async selectSubcase(subcase) {
      this.selectSubcase(subcase);
    }
  }
});
