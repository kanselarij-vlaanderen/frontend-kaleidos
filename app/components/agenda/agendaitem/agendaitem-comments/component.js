import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['o-scroll'],
  store: inject('store'),
  comments: computed('comments', function () {
    let agendaitem = this.get('agendaitem');
    if (agendaitem) {
      return agendaitem.get('comments');
    }
  }),
  actions: {
    async addComment(){
      const { text } = this;
      const agendaitem = await this.get('agendaitem');
      let comment = this.store.createRecord("comment", { text, date_created: new Date(), agendaitem  });
      await comment.save();
    }
  }
});
