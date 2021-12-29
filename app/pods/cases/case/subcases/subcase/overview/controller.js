import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { saveChanges } from 'frontend-kaleidos/utils/agendaitem-utils';

export default class CasesCaseSubcasesSubcaseOverviewController extends Controller {
  @service currentSession;
  @service newsletterService;

  get subcase() {
    return this.model;
  }
  @tracked case;
  @tracked allSubcases;
  @tracked mandatees;
  @tracked submitter;
  @tracked governmentAreas;

  @tracked isEditingTitles = false;

  @action
  cancelEditing() {
    this.isEditingTitles = false;
  }

  @action
  toggleIsEditing() {
    this.isEditingTitles = !this.isEditingTitles;
  }

  @action
  async saveMandateeData(mandateeData) {
    const propertiesToSetOnAgendaitem = {
      mandatees: mandateeData.mandatees,
    };
    const propertiesToSetOnSubcase = {
      mandatees: mandateeData.mandatees,
      requestedBy: mandateeData.submitter,
    };
    this.mandatees = mandateeData.mandatees;
    this.submitter = mandateeData.submitter;
    await saveChanges(this.subcase, propertiesToSetOnAgendaitem, propertiesToSetOnSubcase, true);
  }

  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = this.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.case.save();
  }

  @action
  async updateNewsletterAfterRemarkChange(){
    const agendaItem = await this.store.queryOne('agendaitem', {
      'filter[agenda-activity][subcase][:id:]': this.subcase.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    console.log(agendaItem)
    if (agendaItem?.id){
      const newsletterInfo = await this.store.queryOne('newsletter-info', {
        'filter[agenda-item-treatment][agendaitem][:id:]': agendaItem.id,
      });
      if (newsletterInfo?.id){
        await newsletterInfo.deleteRecord();
        console.log('deleted : ' + newsletterInfo)
      }
      console.log(newsletterInfo)

      if (this.subcase.showAsRemark){
        const remarkAgenda = agendaItem.showAsRemark;
        agendaItem.showAsRemark = true;
        await agendaItem.save();

        const newNewsletterInfo = await this.newsletterService.createNewsItemForAgendaitem(agendaItem,true)
        await newNewsletterInfo.save();

        agendaItem.showAsRemark = remarkAgenda;
        await agendaItem.save();
        console.log('created : ' + newNewsletterInfo)
      }

    }
  }
}
