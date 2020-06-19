import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';
import DS from 'ember-data';

export default class SubcaseTitles extends Component {
  classNames = ['vl-u-spacer-extended-bottom-l'];

  @service currentSession;

  @computed('item', 'shouldShowDetails')
  get agendaId() {
    const { item } = this;
    if (item.get('title')) {
      const values = item.get('title').split('/');
      return values.get('lastObject');
    }

    return null;
  }

  @computed('item', 'shouldShowDetails')
  get meetingId() {
    const { item } = this;
    if (item.get('title')) {
      const values = item.get('title').split('/');
      return values.get('firstObject');
    }

    return null;
  }

  @computed('item.modelName')
  get isAgendaItem() {
    return this.get('item.modelName') == 'agendaitem';
  }

  @computed('item.{subcaseName,subcase.subcaseName}')
  get subcaseName() {
    return this.getSubcaseName();
  }

  @computed('subcaseName', 'item.{subcase.approved,approved}')
  get pillClass() {
    return this.getPillClass();
  }

  @computed('item.{subcase.confidential,confidential}')
  get confidential() {
    const { isAgendaItem, item } = this;
    if (isAgendaItem) {
      return DS.PromiseObject.create({
        promise: item.get('subcase').then((subcase) => subcase.get('confidential')),
      });
    }
    return item.get('confidential');
  }

  @computed('item', 'item.subcase')
  get accessLevel() {
    const { isAgendaItem, item } = this;
    if (isAgendaItem) {
      return DS.PromiseObject.create({
        promise: item.get('subcase').then((subcase) => subcase.get('accessLevel')),
      });
    }
    return DS.PromiseObject.create({
      promise: item.get('accessLevel'),
    });
  }

  @computed('item')
  get case() {
    const item = this.get('item');
    const caze = item.get('case');
    if (caze) {
      return caze;
    }
    return item.get('subcase.case');
  }

  async getSubcaseName() {
    const item = await this.get('item');
    const subcase = await this.get('item.subcase');

    if (!subcase) {
      return item.get('subcaseName');
    }

    const subcaseName = await subcase.get('subcaseName');
    if (!subcaseName) {
      return;
    }
    return subcaseName;
  }

  async getPillClass() {
    const baseClass = 'vl-pill vl-u-text--capitalize';
    if (!await this.subcaseName) {
      return baseClass;
    }
    const approved = await this.get('item.subcase.approved');
    const itemApproved = await this.get('item.approved');
    if (approved || itemApproved) {
      return `${baseClass} vl-pill--success`;
    }
    return baseClass;
  }

  @action
  toggleIsEditingAction() {
    this.toggleIsEditing();
  }
}
