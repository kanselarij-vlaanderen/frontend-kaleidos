import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  store: inject(),
  multipleSteps:true,
  
  actions: {
    async shortTitleChange(event) {
      return await this.shortTitleChange(event.target.value);
    },
    async titleChange(longTitle) {
      return await this.titleChange(longTitle);
    },
    async chooseType(type) {
      return await this.chooseType(type);
    },
    async step() {
      return await this.step();
    }
  }
});
