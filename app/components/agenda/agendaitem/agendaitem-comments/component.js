import Component from '@ember/component';
import { inject } from '@ember/service';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-l'],
  store: inject('store'),

  actions: {
    async addComment(event){
      const agendaitem = await this.get('agendaitem');

      let comment = this.store.createRecord('remark', { text:event, created: new Date(), agendaitem: agendaitem });
      comment.save().then(() => {
        this.set('text', "");
      });
    }
  }
});
