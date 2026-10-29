import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class NewsletterController extends Controller {
  queryParams = ['sort'];

  @service intl;
  @service toaster;
  @service router;

  @tracked sort = 'number';

  @action
  saveNewsItem(wasNewsItemNew) {
    if (wasNewsItemNew) {
      this.router.refresh('newsletter.index');
    }
    this.toaster.success(this.intl.t('successfully-saved'));
  }

  @action
  cancelEdit(wasNewsItemNew) {
    if (wasNewsItemNew) {
      this.router.refresh('newsletter.index');
    }
  }
}
