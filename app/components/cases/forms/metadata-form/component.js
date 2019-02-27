import Component from '@ember/component';

export default Component.extend({
  actions: {
    async shortTitleChange(event) {
      return await this.shortTitleChange(event.target.value);
    },
    async titleChange(longTitle) {
      return await this.titleChange(longTitle);
    },

    async typeChanged(type) {
      this.typeChanged(type);
    }
  }
});
