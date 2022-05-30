import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class NewsletterController extends Controller {
  queryParams = ['sort'];
  @tracked sort = 'number';
}
