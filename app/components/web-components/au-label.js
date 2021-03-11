import Component from '@glimmer/component';

export default class Label extends Component {
  get required() {
    return this.args.isRequired === true;
  }
}
