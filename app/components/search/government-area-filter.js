import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked }  from '@glimmer/tracking';

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

  get showPastGovernmentAreas() {
    return this.args.showPastGovernmentAreas === null ? true : this.args.showPastGovernmentAreas;
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
    this.currentGovernmentAreas = yield this.store.query('concept', {
      'filter[concept-schemes][:id:]': 'f4981a92-8639-4da4-b1e3-0e1371feaa81',
      'filter[deprecated]': false
    });
    
    this.selectedCurrentGovernmentAreasIds = this.selectedGovernmentAreasIds.filter((governmentAreaId) => this.currentGovernmentAreas.find((governmentArea) => governmentArea.id === governmentAreaId));
  }

  @task
  *prepareDeprecatedGovernmentAreas() {
    this.deprecatedGovernmentAreas = yield this.store.query('concept', {
      'filter[concept-schemes][:id:]': 'f4981a92-8639-4da4-b1e3-0e1371feaa81',
      'filter[deprecated]': true
    });

    this.selectedDeprecatedGovernmentAreaIds = this.selectedGovernmentAreasIds.filter((governmentAreaId) => this.deprecatedGovernmentAreas.find((governmentArea) => governmentArea.id === governmentAreaId));
  }



}
