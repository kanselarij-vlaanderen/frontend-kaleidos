import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vl-u-spacer'],
  store: inject('store'),

  remarks: computed('remarks', function () {
    let agendaitem = this.get('agendaitem');
    if (agendaitem) {
      return agendaitem.get('remarks');
    }
  }),

  actions: {
    async addComment(){
      const { text } = this;
      const agendaitem = await this.get('agendaitem');

      let comment = this.store.createRecord('remark', { text:text, created: new Date(), agendaitem: agendaitem });
      await comment.save();
    }
  }
});
