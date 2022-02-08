import Component from '@glimmer/component';

export default class TooltipHelp extends Component {
  get position() {
    return this.args.position || 'bottom';
  }
}
