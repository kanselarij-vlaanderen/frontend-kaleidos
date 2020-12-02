import Component from '@glimmer/component';

export default class Checkbox extends Component {
  get checked() {
    if (this.args.checked) {
      return this.args.checked;
    }
    return false;
  }
}
