import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class NewsletterController extends Controller {
  queryParams = ['sort'];

  @service intl;
  @service toaster;
  @service router;
  @service newsletterService;

  @tracked sort = 'number';

  @task
  *saveNewsletterItem(agendaitem, newsItem) {
    const mustReloadModel = newsItem.isNew;
    yield this.newsletterService.saveNewsItemForAgendaitem(agendaitem, newsItem);
    if (mustReloadModel) {
      this.router.refresh();
    }
    this.toaster.success(this.intl.t('successfully-saved'));
  }
}
