import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { sort } from '@ember/object/computed';
import { updateModifiedProperty } from 'fe-redpencil/utils/modification-utils';

export default class AgendaitemComments extends Component {
  @service store;

  @service formatter;

  @service currentSession;

  classNames = ['vl-grid'];

  elementId = 'agendaitem-comments';

  @sort('item.remarks', (a, b) => {
    if (a.created < b.created) {
      return 1;
    } if (a.created > b.created) {
      return -1;
    }
    return 0;
  })
  sortedRemarks;

  @action
  async addComment(event) {
    const item = await this.item;
    const agenda = await this.item.agenda;
    const user = await this.currentSession.user;
    const comment = this.store.createRecord('remark', {
      text: event,
      created: this.formatter.formatDate(null),
      author: user,
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
        updateModifiedProperty(agenda);
      }
    });
  }

  @action
  async addAnswer(comment) {
    const user = await this.currentSession.user;
    const agenda = await this.item.agenda;
    const newComment = this.store.createRecord('remark', {
      text: comment.get('answer'),
      created: this.formatter.formatDate(null),
      author: user,
    });
    newComment.save().then((savedComment) => {
      comment.get('answers').addObject(savedComment);
      comment.set('answer', '');
      if (agenda) {
        updateModifiedProperty(agenda);
      }
      comment.save();
    });
  }
}
