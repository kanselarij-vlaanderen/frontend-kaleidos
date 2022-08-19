import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import bind from 'frontend-kaleidos/utils/bind';

export default class NewslettersController extends Controller {
  @service router;

  queryParams = {
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    sort: {
      type: 'string',
    },
  };

  sizeOptions = Object.freeze([10, 25, 50, 100, 200]);

  @tracked page;
  @tracked size;
  @tracked sort = '-planned-start,number-representation';
  @tracked isAdding = false;
  @tracked isEditing = false;

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = this.sizeOptions[0];
  }

  @bind
  async latestAgenda(meeting) {
    const agendas = await meeting.agendas;
    return agendas?.sortBy('serialnumber').reverse().firstObject;
  }

  @action
  async navigateToNewsletter(meeting) {
    this.router.transitionTo('newsletter', meeting.id);
  }
}
