import Component from '@ember/component';
import {inject} from '@ember/service';
import {computed} from '@ember/object';
import moment from 'moment';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, ModifiedMixin, {
  store: inject(),
  agendaService: inject(),
  router: inject(),
  classNames: ["vlc-page-header"],
  isAssigningToOtherAgenda: false,
  isAssigningToOtherCase: false,
  promptDeleteCase: false,
  isShowingOptions: false,
  isAssigning: false,
  subcase: null,
  caseToDelete: null,

  meetings: computed('store', function () {
    const dateOfToday = moment().utc().subtract(1, 'weeks').format();
    const dateInTwoWeeks = moment().utc().add(6, 'weeks').format();

    return this.store.query('meeting', {
      filter: {
        ':gte:planned-start': dateOfToday,
        ':lte:planned-start': dateInTwoWeeks,
        'is-final': false
      },
      sort: 'planned-start'
    })
  }),

  async deleteSubcase(subcase) {
    const itemToDelete = await this.store.findRecord('subcase', subcase.get('id'), {reload: true});
    const newsletterInfo = await itemToDelete.get('newsletterInfo');
    if (newsletterInfo) {
      await newsletterInfo.destroyRecord();
    }
    await itemToDelete.destroyRecord();
  },

  async triggerDeleteCaseDialog() {
    this.set('promptDeleteCase', true);
  },

  actions: {
    showMultipleOptions() {
      this.toggleProperty('isShowingOptions');
    },

    async proposeForAgenda(subcase, meeting) {
      this.set('isAssigning', true);
      const meetingRecord = await this.store.findRecord('meeting', meeting.get('id'));
      const designAgenda = await this.store.findRecord('agenda', (await meetingRecord.get('latestAgenda')).get('id'));
      await designAgenda.reload(); //ensures latest state is pulled
      if (designAgenda.get('name') === "Ontwerpagenda") {
        await this.get('agendaService').createNewAgendaItem(designAgenda, subcase);
      }
      await subcase.hasMany('agendaitems').reload();
      this.set('isAssigning', false);
    },
    proposeForOtherAgenda(subcase) {
      this.toggleProperty('isAssigningToOtherAgenda');
      this.set('selectedSubcase', subcase);
    },

    cancel() {
      this.set('isAssigningToOtherAgenda', false);
      this.set('isAssigningToOtherCase', false);
      this.set('selectedSubcase', null);
    },

    async deleteSubcase(subcase) {
      subcase.hasMany('agendaitems').reload();
      const caze = await subcase.get('case');
      const agendaitems = await subcase.get('agendaitems');
      if (agendaitems && agendaitems.length > 0) {
        return;
      } else {
        await this.deleteSubcase(subcase);
      }
      this.set('isDeletingSubcase', false);
      this.router.transitionTo('cases.case.subcases', caze.id);
    },
    unarchiveSubcase(subcase) {
      subcase.set('isArchived', false);
      subcase.save();
    },
    closeSubcase(subcase) {
      const concluded = subcase.get('concluded');
      subcase.set('concluded', !concluded);
      subcase.save();
    },
    async deleteCase() {
      const itemToDelete = await this.store.findRecord('case', this.get("caseToDelete.id"));
      await itemToDelete.destroyRecord();
      this.get('router').transitionTo('cases');
    },

    triggerMoveSubcaseDialog() {
      this.set('isAssigningToOtherCase', true);

    },
    async moveSubcase(newCase) {
      this.subcase.set("case", newCase);
      await this.subcase.save();

      this.set('isAssigningToOtherCase', false);
      let caze = this.subcase.get('case');
      caze = await this.store.findRecord('case', caze.get("id"));
      caze.hasMany('subcases').reload();
      this.set('caseToDelete', caze);
      const subCases = caze.get('subcases');
      if (subCases.length > 0) {
        this.get('router').transitionTo('cases.case.subcases');
      } else {
        this.get('router').transitionTo('cases.case.subcases');
        // Prompt the user to Delete the case.
        // This works fine, but if the delete is done, there are indexing issues.
        //this.triggerDeleteCaseDialog();
      }
    },
    requestDeleteSubcase() {
      this.set('isDeletingSubcase', true);
    },
    cancelDeleteSubcase() {
      this.set('isDeletingSubcase', false);
    },
    cancelDeleteCase() {
      this.set('promptDeleteCase', false);
      this.get('router').transitionTo('cases.case.subcases');
    }
  },
});
