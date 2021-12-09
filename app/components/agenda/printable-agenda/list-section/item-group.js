import Component from '@glimmer/component';

export default class ItemGroup extends Component {
  get items() {
    return {
      first: this.args.items[0],
      remainder: this.args.items.slice(1)
    };
  }
}
