import Component from '@glimmer/component';

/**
 * @argument {Number} progress: progress in percent (0-100)
 */
export default class ProgressBar extends Component {
  get decimalProgress() {
    return this.args.progress / 100;
  }

  get complete() {
    return this.args.progress === 100;
  }
}
