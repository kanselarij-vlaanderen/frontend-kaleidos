import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class CasesSubmissionsAgendaItemTypeSelectorComponent extends Component {
  @service conceptStore;
  @service store;

  @tracked agendaItemType;
  @tracked agendaItemTypes;

  constructor() {
    super(...arguments);
    this.loadAgendaItemTypes.perform();
  }

  loadAgendaItemTypes = task(async () => {
    this.agendaItemTypes = await this.conceptStore.queryAllByConceptScheme(CONSTANTS.CONCEPT_SCHEMES.AGENDA_ITEM_TYPES);
    this.agendaItemType = await this.store.findRecordByUri('concept', CONSTANTS.AGENDA_ITEM_TYPES.NOTA);
    this.args.onChangeAgendaItemType?.(this.agendaItemType);
  });
}
