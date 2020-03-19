import Component from '@ember/component';
import { inject } from '@ember/service';
import { sort } from '@ember/object/computed';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';

export default Component.extend(isAuthenticatedMixin, ModifiedMixin, {
  classNames: ['vl-grid'],
  elementId: 'agendaitem-comments',
  store: inject(),
  formatter: inject(),

  sortedRemarks: sort('item.remarks', function (a, b) {
    if (a.created < b.created) {
      return 1;
    } else if (a.created > b.created) {
      return -1;
    }
    return 0;
  }),

  actions: {
    async addComment(event) {
      const item = await this.get('item');
      const agenda = await this.get('item.agenda');
      const user = await this.get('user');
      const comment = this.store.createRecord('remark', {
        text: event,
        created: this.formatter.formatDate(null),
        author: user
      });
      const modelName = await item.get('modelName');
      if (modelName == 'newsletter-info') {
        comment.set('newsletterInfo', item);
      } else {
        comment.set(modelName, item);
      }
      comment.save().then(() => {
        item.hasMany('remarks').reload();
        this.set('text', '');
        if (agenda) {
          this.updateModifiedProperty(agenda);
        }
      });
    },

    async addAnswer(comment) {
      const user = await this.get('user');
      const agenda = await this.get('item.agenda');
      const newComment = this.store.createRecord('remark', {
        text: comment.get('answer'),
        created: this.formatter.formatDate(null),
        author: user
      });
      newComment.save().then(savedComment => {
        comment.get('answers').addObject(savedComment);
        comment.set('answer', '');
        if (agenda) {
          this.updateModifiedProperty(agenda);
        }
        comment.save();
      });
    }
  }
});
