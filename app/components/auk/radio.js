import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { warn } from '@ember/debug';

/**
 *
 * @argument {String} name
 * @argument {Boolean} checked
 * @argument {String} label
 * @argument {String} sublabel
 */
export default class Radio extends Component {
  constructor() {
    super(...arguments);
    warn(`Using ${this.constructor.name} without providing @name is most likely to be an oversight`, isEmpty(this.args.name), {
      id: 'auk.name-argument',
    });
  }

  get name() {
    if (isEmpty(this.args.name)) {
      return 'radio-buttons';
    }
    return this.args.name;
  }
}
