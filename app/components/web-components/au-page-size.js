import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
export default class AuPageSize extends Component {
  @tracked sizeOptions =  this.args.sizeOptions ? this.args.sizeOptions : [10, 25, 50, 100, 200];
}
