import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class NewsletterController extends Controller {
  queryParams = ['sort'];

  @service intl;
  @service toaster;
  @service router;

  @tracked sort = 'number';

  @task
  *saveNewsletterItem(newsItem) {
    const mustReloadModel = newsItem.isNew;
    yield newsItem.save();
    if (mustReloadModel) {
      this.router.refresh();
    }
    this.toaster.success(this.intl.t('successfully-saved'));
  }
}
