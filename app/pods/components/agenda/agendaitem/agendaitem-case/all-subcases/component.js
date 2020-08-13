import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AllSubcases extends Component {
  @action
  toggleIsShowingDocuments(subcase) {
    subcase.toggleProperty('isShowingDocuments');
  }
}
