import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class NewsletterController extends Controller {
  queryParams = ['sort'];

  @service intl;
  @service toaster;

  @tracked sort = 'number';

  @task
  *saveNewsletterItem(newsletterItem, wasNewsItemNew) {
    yield newsletterItem.save();
    if (wasNewsItemNew) {
      this.send('reloadModel');
    }
    this.toaster.success(this.intl.t('successfully-saved'));
  }

  @action
  cancelEdit(wasNewsItemNew) {
    if (wasNewsItemNew) {
      this.send('reloadModel');
    }
  }
}
