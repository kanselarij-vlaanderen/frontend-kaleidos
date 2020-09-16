import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AllSubcases extends Component {
  @action
  // eslint-disable-next-line class-methods-use-this
  toggleIsShowingDocuments(subcase) {
    subcase.toggleProperty('isShowingDocuments');
  }
}
