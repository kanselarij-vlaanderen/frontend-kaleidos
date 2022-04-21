import Component from '@glimmer/component';
export default class SubcaseTitlesPanelView extends Component {
  async getPillSkin() {
    const approved = await this.args.subcase.approved;
    if (approved) {
      return 'success';
    }
    return 'default';
  }
}
