import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';

export default class StyleguideSample extends Component {
  @tracked visibility = true;
  // code open or closed on the sample level

  get modifierClass() {
    if (isPresent(this.args.modifier)) {
      return `br-styleguide-sample__sample--${this.args.modifier}`;
    }
    return '';
  }

  @action
  toggleVisibility() {
    this.visibility = !this.visibility;
  }
}
