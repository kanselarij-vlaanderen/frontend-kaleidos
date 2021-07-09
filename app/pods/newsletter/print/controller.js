import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class PrintNewsletterController extends Controller {
  queryParams = {
    showDraft: {
      type: 'boolean',
      // as: 'klad',
    },
  };

  @tracked showDraft = false;
}
