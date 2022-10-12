import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class UsersSettingsController extends Controller {
  sizeOptions = [5, 10, 20, 50, 100, 200];
  @tracked size = 10;
  @tracked page = 0;
  @tracked sort = 'first-name';
  @tracked filter;

  @tracked searchTextBuffer;

  @tracked userBeingBlocked;
  @tracked showBlockMembership = false;
  @tracked showBlockUser = false;

  @action
  selectSize(size) {
    this.size = size;
  }

  @action
  search(e) {
    e.preventDefault();
    this.filter = this.searchTextBuffer;
  }
}
