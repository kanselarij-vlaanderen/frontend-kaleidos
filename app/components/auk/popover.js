import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';

export default class Popover extends Component {
  @tracked targetElement = undefined;
  @tracked isShown = false;

  get title() {
    return this.args.title || '';
  }

  get placement() {
    return this.args.placement || 'top';
  }

  show = () => {
    this.isShown = true;
  };

  hide = () => {
   this.isShown = false;
  };

  toggle = () => {
    this.isShown = !this.isShown;
  };

  target = modifier((element) => {
    this.targetElement = element;

    element.addEventListener('click', this.toggle);

    return () => {
      element.removeEventListener('click', this.show);
    };
  });
}
