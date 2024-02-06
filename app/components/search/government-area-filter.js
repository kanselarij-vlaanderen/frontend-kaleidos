import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked }  from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class SearchGovernmentAreaFilterComponent extends Component {
  @service store;

  @tracked currentGovernmentAreas = [];
  @tracked deprecatedGovernmentAreas = [];
  @tracked selectedCurrentGovernmentAreasIds = [];
  @tracked selectedDeprecatedGovernmentAreaIds = [];

  @tracked deprecatedGovernmentAreasHidden = true;

  constructor() {
    super(...arguments);

    this.prepareGovernmentAreas.perform();
  }

  get selectedGovernmentAreasIds() {
    return this.args.selected === null ? [] : this.args.selected;
  }

  get selectedCurrentGovernmentAreas() {
    return this.selectedCurrentGovernmentAreasIds.map((governmentAreaId) => 
    this.currentGovernmentAreas.find((governmentArea) => governmentArea.id === governmentAreaId ))
  }

  get selectedDeprecatedGovernmentAreas() {
    return this.selectedDeprecatedGovernmentAreaIds.map((governmentAreaId) => 
    this.deprecatedGovernmentAreas.find((governmentArea) => governmentArea.id === governmentAreaId))
  }

  @action
  onChangeCurrentGovernmentAreas(selectedGovernmentAreas) {
    this.selectedCurrentGovernmentAreasIds = selectedGovernmentAreas.map((a) => a.id);
    this.onChangeGovernmentAreas();
  }

  @action
  onChangeDeprecatedGovernmentAreas(selectedDeprecatedGovernmentAreas) {
    this.selectedDeprecatedGovernmentAreaIds = selectedDeprecatedGovernmentAreas.map((a) => a.id);
    this.onChangeGovernmentAreas();
  }

  @action
  onChangeGovernmentAreas() {
    this.args.onChange?.([...this.selectedCurrentGovernmentAreasIds, ...this.selectedDeprecatedGovernmentAreaIds])
  }

  @task
  *prepareGovernmentAreas() {
    yield this.prepareCurrentGovernmentAreas.perform();
    yield this.prepareDeprecatedGovernmentAreas.perform();
  }

  @task
  *prepareCurrentGovernmentAreas() {
    const currentGovernmentAreas = yield this.store.queryAll('concept', {
      'filter[concept-schemes][:uri:]': CONSTANTS.CONCEPT_SCHEMES.BELEIDSDOMEIN,
      'filter[deprecated]': false,
      sort: 'label',
    });
    this.currentGovernmentAreas = currentGovernmentAreas.slice();
  
    this.selectedCurrentGovernmentAreasIds = this.selectedGovernmentAreasIds.filter((governmentAreaId) => this.currentGovernmentAreas.find((governmentArea) => governmentArea.id === governmentAreaId));
  }

  @task
  *prepareDeprecatedGovernmentAreas() {
    const deprecatedGovernmentAreas = yield this.store.queryAll('concept', {
      'filter[concept-schemes][:uri:]': CONSTANTS.CONCEPT_SCHEMES.BELEIDSDOMEIN,
      'filter[deprecated]': true,
      sort: 'label',
    });
    this.deprecatedGovernmentAreas = deprecatedGovernmentAreas.slice();

    this.selectedDeprecatedGovernmentAreaIds = this.selectedGovernmentAreasIds.filter((governmentAreaId) => this.deprecatedGovernmentAreas.find((governmentArea) => governmentArea.id === governmentAreaId));
  }



}
