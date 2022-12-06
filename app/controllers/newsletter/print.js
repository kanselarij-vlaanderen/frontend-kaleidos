import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class PrintNewsletterController extends Controller {
  queryParams = {
    showDraft: {
      type: 'boolean',
    },
  };

  @service newsletterService;

  @tracked showDraft = false;

  @task
  *saveNewsletterItem(agendaitem, newsItem) {
    yield this.newsletterService.saveNewsItemForAgendaitem(agendaitem, newsItem);
  }
}
