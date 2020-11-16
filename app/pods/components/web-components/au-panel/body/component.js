import Component from '@glimmer/component';

export default class PanelBody extends Component {
  get noPadding() {
    if (this.args.noPadding) {
      return 'auk-panel__body--no-pad';
    }
    return '';
  }
}
