import Component from '@ember/component';

export default Component.extend({
  actions : {
    selectAvailableSubcase(subcase) {
      this.selectSubcase(subcase);
    }
  }
});

