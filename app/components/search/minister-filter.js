import Component from '@glimmer/component';
import { tracked }  from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { startOfDay } from 'date-fns';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SearchMinisterFilterComponent extends Component {
  @service mandatees;
  @service store;

  @tracked currentMinisters = [];
  @tracked pastMinisters = [];
  @tracked pastMinistersHidden = true;

  @tracked selectedCurrentMinisterIds = [];
  @tracked selectedPastMinisterIds = [];

  visibleRoleUris = [
    // first 2 are not really needed here, they should also be a minister
    // CONSTANTS.MANDATE_ROLES.MINISTER_PRESIDENT,
    // CONSTANTS.MANDATE_ROLES.VICEMINISTER_PRESIDENT,
    CONSTANTS.MANDATE_ROLES.MINISTER,
    CONSTANTS.MANDATE_ROLES.VOORZITTER,
    CONSTANTS.MANDATE_ROLES.GEMEENSCHAPSMINISTER,
  ];

  constructor() {
    super(...arguments);

    this.prepareMinisters.perform();
  }

  get selectedMinisterIds() {
    return this.args.selected === null ? [] : this.args.selected;
  }

  get selectedCurrentMinisters() {
    return this.selectedCurrentMinisterIds.map((ministerId) =>
      this.currentMinisters.find((minister) => minister.id === ministerId)
    );
  }

  get selectedPastMinisters() {
    return this.selectedPastMinisterIds.map((ministerId) =>
      this.pastMinisters.find((minister) => minister.id === ministerId)
    );
  }

  @action
  onChangeCurrentMinisters(selected) {
    this.selectedCurrentMinisterIds = selected.map((m) => m.id)
    this.onChangeMinisters();
  }

  @action
  onChangePastMinisters(selected) {
    this.selectedPastMinisterIds = selected.map((m) => m.id)
    this.onChangeMinisters();
  }

  @action
  onChangeMinisters() {
    this.args.onChange?.([...this.selectedCurrentMinisterIds, ...this.selectedPastMinisterIds]);
  }

  prepareMinisters = task(async () => {
    await this.prepareCurrentMinisters.perform();
    if (this.args.showPastMinisters) {
      await this.preparePastMinisters.perform();
    }
  });

  prepareCurrentMinisters = task(async () => {
    const currentMandatees = await this.mandatees.getMandateesActiveOn.linked().perform(startOfDay(new Date()));
    const sortedMandatees = currentMandatees
          .sort((m1, m2) => m1.priority - m2.priority)
    const sortedMinisters = await Promise.all(
      sortedMandatees.map((m) => m.person)
    );
    this.currentMinisters = [...new Set(sortedMinisters)];
    this.selectedCurrentMinisterIds = this.selectedMinisterIds.filter((ministerId) => this.currentMinisters.find((minister) => minister.id === ministerId));
  });

  preparePastMinisters = task(async () => {
    const visibleRoles = await Promise.all(
      this.visibleRoleUris.map((role) => this.store.findRecordByUri('role', role))
    );
    const allMinisters = await this.store.queryAll('person', {
      'filter[:has:mandatees]': true,
      'filter[mandatees][mandate][role][:id:]': visibleRoles
      .map((role) => role.id)
      .join(','),
      sort: 'last-name'
    });
    this.pastMinisters = allMinisters
      .filter((minister) => !this.currentMinisters.includes(minister))
      .filter((minister) => minister.uri.startsWith('http://themis.vlaanderen.be'));
    this.selectedPastMinisterIds = this.selectedMinisterIds.filter((ministerId) => this.pastMinisters.find((minister) => minister.id === ministerId));
  });
}
