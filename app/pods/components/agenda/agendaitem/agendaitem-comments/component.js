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

  @sort('agendaitem.remarks', (remarkA, remarkB) => {
    if (remarkA.created < remarkB.created) {
      return 1;
    } if (remarkA.created > remarkB.created) {
      return -1;
    }
    return 0;
  })
  sortedRemarks;

  @action
  async addComment(event) {
    const agendaitem = await this.agendaitem;
    const agenda = await this.agendaitem.agenda;
    const user = await this.currentSession.user;
    const comment = this.store.createRecord('remark', {
      text: event,
      created: this.formatter.formatDate(null),
      author: user,
    });
    const modelName = await agendaitem.get('modelName');
    if (modelName === 'newsletter-info') {
      comment.set('newsletterInfo', agendaitem);
    } else {
      comment.set(modelName, agendaitem);
    }
    comment.save().then(() => {
      agendaitem.hasMany('remarks').reload();
      this.set('text', '');
      if (agenda) {
        updateModifiedProperty(agenda);
      }
    });
  }

  @action
  async addAnswer(comment) {
    const user = await this.currentSession.user;
    const agenda = await this.agendaitem.agenda;
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
