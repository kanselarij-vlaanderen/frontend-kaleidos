import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class SubcaseProcessSubcases extends Component {
  @action
  toggleIsShowingDocuments(subcase) {
    subcase.toggleProperty('isShowingDocuments');
  }
}
