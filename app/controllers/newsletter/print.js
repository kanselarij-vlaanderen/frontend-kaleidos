import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class PrintNewsletterController extends Controller {
  queryParams = {
    showDraft: {
      type: 'boolean',
    },
  };

  @tracked showDraft = false;

  @action
  async saveNewsletterChanges(newsletterInfo) {
    await newsletterInfo.save();
  }
}
