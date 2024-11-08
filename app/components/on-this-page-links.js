import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class OnThisPageLinksComponent extends Component {
  @action
  scrollToFragment(fragName, e) {
    // chrome does not work correctly with fragment scrolling, custom override needed
    e.preventDefault();
    const fragmentElement = document.getElementById(`${fragName}`);
    if (fragmentElement) {
      fragmentElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }
}
