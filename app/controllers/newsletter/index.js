import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class NewsletterController extends Controller {
  queryParams = ['sort'];

  @service intl;
  @service toaster;

  @tracked sort = 'number';

  @task
  *saveNewsletterItem(newsletterItem) {
    const mustReloadModel = newsletterItem.isNew;
    yield newsletterItem.save();
    if (mustReloadModel) {
      this.send('reloadModel');
    }
    this.toaster.success(this.intl.t('successfully-saved'));
  }
}
