import Component from '@ember/component';
import { inject } from '@ember/service';
import { sort } from '@ember/object/computed';

export default Component.extend({
  classNames: ['vl-u-spacer-extended-l'],
  store: inject('store'),

  sortedRemarks: sort('agendaitem.remarks', function(a, b) {
      if (a.created < b.created) {
        return 1;
      } else if (a.created > b.created) {
        return -1;
      }
      return 0;
    }),

  actions: {
    async addComment(event){
      const agendaitem = await this.get('agendaitem');

      const comment = this.store.createRecord('remark', { text:event, created: new Date(), agendaitem: agendaitem });
      comment.save().then(() => {
        this.set('text', "");
      });
    },

    async addAnswer(comment) {
      const newComment = this.store.createRecord('remark', { text:comment.get('answer'), created: new Date()});
      newComment.save().then(savedComment => {
        comment.get('answers').addObject(savedComment);
        comment.save();
      });
    }
  }
});
