import Component from '@glimmer/component';

export default class SubcaseDetailNavComponent extends Component {
  get currentRoute() {
    return this.args.currentRoute;
  }
}
