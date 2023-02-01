import Component from '@glimmer/component';

export default class ResultsHeader extends Component {
  get fromResultIndex() {
    return this.args.pageIdx * this.args.pageSize + 1;
  }

  get toResultIndex() {
    return this.fromResultIndex + this.args.nbOfItems - 1;
  }
}
