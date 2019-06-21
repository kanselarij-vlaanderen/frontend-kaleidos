import Component from '@ember/component';
import { inject } from '@ember/service';
import { sort } from '@ember/object/computed';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, ModifiedMixin, {
  classNames: ['vl-grid'],
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
      const agenda = await this.get('agendaitem.agenda');
      const user = await this.get('user');
      const comment = this.store.createRecord('remark',
        {
          text: event,
          created: moment().utc().toDate(),
          agendaitem: agendaitem,
          author: user
        });
      comment.save().then(() => {
        this.set('text', "");
        this.updateModifiedProperty(agenda);
      });
    },

    async addAnswer(comment) {
      const user = await this.get('user');
      const agenda = await this.get('agendaitem.agenda');
      const newComment = this.store.createRecord('remark',
        {
          text: comment.get('answer'),
          created: moment().utc().toDate(),
          author: user
        });
      newComment.save().then(savedComment => {
        comment.get('answers').addObject(savedComment);
        comment.set('answer', "");
        this.updateModifiedProperty(agenda);
        comment.save();
      });
    },

    async deleteComment(comment) {
      this.set('commentToDelete', await comment);
      this.set('isVerifyingDelete', true);
    },

    async verify() {
      await this.commentToDelete.destroyRecord();
      this.set('isVerifyingDelete', false);
    },

    cancel() {
      this.set('commentToDelete', null);
      this.set('isVerifyingDelete', false);
    }
  }
});
