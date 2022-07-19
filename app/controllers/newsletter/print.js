import Controller from '@ember/controller';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class PrintNewsletterController extends Controller {
  queryParams = {
    showDraft: {
      type: 'boolean',
    },
  };

  @tracked showDraft = false;

  @task
  *saveNewsletterItem(newsletterItem) {
    yield newsletterItem.save();
  }
}
