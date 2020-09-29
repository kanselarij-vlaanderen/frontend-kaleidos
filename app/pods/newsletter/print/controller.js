import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class PrintNewsletterController extends Controller {
  queryParams = {
    showDraft: {
      type: 'boolean',
    },
  };

  @tracked showDraft = false;
}
