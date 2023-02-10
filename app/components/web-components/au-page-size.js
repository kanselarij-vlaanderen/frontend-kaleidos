import Component from '@glimmer/component';

export default class AuPageSize extends Component {
  defaultSizeOptions = Object.freeze([10, 25, 50, 100, 200]);

  get sizeOptions() {
    return this.args.sizeOptions || this.defaultSizeOptions;
  }
}
