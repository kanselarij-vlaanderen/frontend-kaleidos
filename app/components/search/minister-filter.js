import Component from '@glimmer/component';
import { tracked }  from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { startOfDay } from 'date-fns';

export default class SearchMinisterFilterComponent extends Component {
  @service mandatees;
  @service store;

  @tracked currentMinisters = [];
  @tracked pastMinisters = [];
  @tracked pastMinistersHidden = true;

  @tracked selectedCurrentMinisterIds = [];
  @tracked selectedPastMinisterIds = [];

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

  get selectedCurrentMinistersName() {
    return this.selectedCurrentMinisterIds.map((ministerLabel) =>
      this.currentMinisters.find((minister) => minister.fullName === ministerLabel)
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

  @task
  *prepareMinisters() {
    yield this.prepareCurrentMinisters.perform();
    if (this.args.showPastMinisters) {
      yield this.preparePastMinisters.perform();
    }
  }

  @task
  *prepareCurrentMinisters() {
    const currentMandatees = yield this.mandatees.getMandateesActiveOn.perform(startOfDay(new Date()));
    const sortedMandatees = currentMandatees
          .sort((m1, m2) => m1.priority - m2.priority)
    const sortedMinisters = yield Promise.all(
      sortedMandatees.map((m) => m.person)
    );
    this.currentMinisters = [...new Set(sortedMinisters)];
    this.selectedCurrentMinisterIds = this.selectedMinisterIds.filter((ministerId) => this.currentMinisters.find((minister) => minister.id === ministerId));
  }

  @task
  *preparePastMinisters() {
    const allMinisters = yield this.store.queryAll('person', {
      'filter[:has:mandatees]': true,
      sort: 'last-name'
    });
    this.pastMinisters = allMinisters
      .filter((minister) => !this.currentMinisters.includes(minister))
      .filter((minister) => minister.uri.startsWith('http://themis.vlaanderen.be'));
    this.selectedPastMinisterIds = this.selectedMinisterIds.filter((ministerId) => this.pastMinisters.find((minister) => minister.id === ministerId));
  }

  // Mockup data
  JanJambon = [
    'Buitenlandse Zaken',
    'Cultuur',
    'Digitalisering',
    'Facilitair Management'
  ]

  HildeCrevits = [
    'Openbare Werken',
    'Energie',
    'Leefmilieu',
    'Natuur'
  ]

  BartSomers = [
    'Binnenlands Bestuur',
    'Bestuurszaken',
    'Inburgering',
    'Gelijke kansen'
  ]

  BenWeyts = [
    'Mobiliteit',
    'Openbare Werken',
    'Vlaamse Rand',
    'Toerisme',
    'Dierenwelzijn'
  ]

  ZuhalDemir = [
    'Justitie en handhaving',
    'Omgeving',
    'Energie',
    'Toerisme',
  ]

  MatthiasDiependaele = [
    'Financiën',
    'Begroting',
    'Wonen',
    'Onroerend Erfgoed',
  ]

  LydiaPeeters = [
    'Begroting',
    'Financiën',
    'Energie',
  ]

  BenjaminDalle = [
    'Brussel',
    'Jeugd',
    'Media',
  ]

  JoBrouns = [
    'Economie',
    'Innovatie',
    'Werk',
    'Sociale Economie',
    'Landbouw'
  ]
}
