import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import bind from 'frontend-kaleidos/utils/bind';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class NewslettersIndexController extends Controller {
  @service router;

  queryParams = [
    {
      page: {
        type: 'number',
      },
      size: {
        type: 'number',
      },
      sort: {
        type: 'string',
      },
    }
  ];

  @tracked isLoadingModel;
  @tracked page;
  @tracked size;
  @tracked sort = '-planned-start,number-representation';

  constructor() {
    super(...arguments);
    this.page = 0;
    this.size = PAGINATION_SIZES[1];
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
