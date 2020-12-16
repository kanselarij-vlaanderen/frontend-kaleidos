import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SubCasesOverviewHeader extends Component {
  // Services
  @service currentSession;

  // Tracked.
  @tracked isAddingSubcase = false;
  @tracked title = null;
  @tracked shortTitle = null;

  // Returns the title of the case.
  get caseTitle() {
    const _case = this.args.model.case;
    const shortTitle = _case.shortTitle;
    if (shortTitle) {
      return shortTitle;
    }
    return _case.title;
  }

  // This is needed to give the input-helpers a proper string instead of
  // a promise object based on the previous subcase or known case
  async setKnownPropertiesOfCase() {
    const caze = await this.args.model.case;
    const latestSubcase = await caze.get('latestSubcase');
    if (latestSubcase) {
      this.title = latestSubcase.get('title');
      this.shortTitle = latestSubcase.get('shortTitle');
    } else {
      this.title = caze.title;
      this.shortTitle = caze.shortTitle;
    }
  }

  @action
  async toggleIsAddingSubcase() {
    await this.setKnownPropertiesOfCase();
    this.isAddingSubcase = true;
  }

  @action
  refresh() {
    this.args.refresh();
  }

  @action
  close() {
    this.isAddingSubcase = false;
  }
}
