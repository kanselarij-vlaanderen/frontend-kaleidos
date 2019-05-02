import Component from '@ember/component';
import { inject } from '@ember/service';
import { sort } from '@ember/object/computed';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
  classNames: ['vlc-padding-bottom--large'],
  store: inject('store'),

  sortedRemarks: sort('agendaitem.remarks', function (a, b) {
    if (a.created < b.created) {
      return 1;
    } else if (a.created > b.created) {
      return -1;
    }
    return 0;
  }),

  actions: {
    async addComment(event) {
      const agendaitem = await this.get('agendaitem');
      const user = await this.get('user');
      const comment = this.store.createRecord('remark',
        {
          text: event,
          created: new Date(),
          agendaitem: agendaitem,
          author: user
        });
      comment.save().then(() => {
        this.set('text', "");
      });
    },

    async addAnswer(comment) {
      const user = await this.get('user');
      const newComment = this.store.createRecord('remark', 
      { 
        text: comment.get('answer'), 
        created: new Date(),
        author: user
      });
      newComment.save().then(savedComment => {
        comment.get('answers').addObject(savedComment);
        comment.set('answer', "");
        comment.save();
      });
    }
  }
});
