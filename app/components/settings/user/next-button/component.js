import Component from '@glimmer/component';
import { inject } from '@ember/service';
import { action } from '@ember/object';

export default class NextButton extends Component {
  router = inject();

  @action
  async onRowClick() {
    const account = await this.args.row.account;
    const user = await account.user;
    const userId = await user.id;
    this.args.goToRoute('settings.users.user',userId);
  }
}
