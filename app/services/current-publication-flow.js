import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentPublicationFlowService extends Service {
  @service store;

  @tracked publicationFlow;

  async load(id) {
    this.publicationFlow = await this.store.findRecord('publication-flow', id, {
      include: [
        'case',
        'case.subcases',
        'agenda-item-treatment',
        'status',
        'mode',
        'identification.structured-identifier',
        'urgency-level',
        'regulation-type',
        'publication-status-change',
        'numac-numbers',
        'publication-subcase',
        'translation-subcase',
        'contact-persons',
        'contact-persons.person',
        'contact-persons.person.organization',
        'mandatees',
        'mandatees.person',
      ].join(','),
    });
  }

  async reload() {
    await this.load(this.publicationFlow.id);
  }

  async save() {
    await this.publicationFlow.save();
  }

  unload(){
    this.publicationFlow = null;
  }
}
