import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class Responsive extends Helper {
  @service responsive;

  constructor() {
    super(...arguments);
    this.responsive.on('breakpointChanged', () => this.recompute());
  }

  compute = ([prop]) => this.responsive[prop];
}
