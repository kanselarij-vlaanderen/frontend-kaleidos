import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class SettingsOrganizationsIndexController extends Controller {
  @tracked size = 10;
  @tracked page = 0;
  @tracked sort = 'identifier';
  @tracked filter;
}
