import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class NewsletterController extends Controller {
  queryParams = ['sort'];

  @service intl;
  @service toaster;
  @service router;

  @tracked sort = 'number';

  @action
  async saveNewsItem(wasNewsItemNew) {
    if (wasNewsItemNew) {
      this.router.refresh('newsletter.index');
    }
    this.toaster.success(this.intl.t('successfully-saved'));
  }

  @action
  async cancelEdit(wasNewsItemNew) {
    if (wasNewsItemNew) {
      this.router.refresh('newsletter.index');
    }
  }
}
