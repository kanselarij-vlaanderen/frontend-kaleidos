import Component from '@glimmer/component';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class AuPageSize extends Component {
  defaultSizeOptions = PAGINATION_SIZES;

  get sizeOptions() {
    return this.args.sizeOptions || this.defaultSizeOptions;
  }
}
