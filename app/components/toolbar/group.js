import Component from '@glimmer/component';

export default class ToolbarGroup extends Component {

  get side() {
    if (this.args.side)
      return "vlc-toolbar__"+this.args.side;
    else
      return "vlc-toolbar__left";
  }

}
