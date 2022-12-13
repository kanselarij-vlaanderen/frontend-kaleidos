import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PrintNewsletterController extends Controller {
  queryParams = {
    showDraft: {
      type: 'boolean',
    },
  };

  @tracked showDraft = false;

  @task
  *saveNewsletterItem(newsItem) {
    yield newsItem.save();
  }
}
