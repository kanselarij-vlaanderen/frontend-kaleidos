import Component from '@ember/component';
import { inject } from '@ember/service';
import moment from 'moment';

export default Component.extend({
  classNames: ['vl-u-spacer'],
  store: inject('store'),

  actions: {
    async addComment(){
      const { text } = this;
      const agendaitem = await this.get('agendaitem');

      let comment = this.store.createRecord('remark', { text:text, created: new Date(), agendaitem: agendaitem });
      await comment.save();
    }
  }
});
