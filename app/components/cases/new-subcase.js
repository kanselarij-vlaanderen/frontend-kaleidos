import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';
import CONFIG from 'frontend-kaleidos/utils/config';
import { trimText } from 'frontend-kaleidos/utils/trim-util';

export default Component.extend({
  store: inject(),
  newsletterService: inject(),
  confidentiality: null,
  title: null,
  shortTitle: null,
  filter: Object.freeze({
    type: 'subcase-name',
  }),

  confidential: computed('case', function() {
    return this.get('case.confidential');
  }),

  caseTypes: computed('store', async function() {
    return await this.store.query('case-type', {
      sort: '-label',
      filter: {
        deprecated: false,
      },
    });
  }),

  fetchSubcasePieces: async function(subcase) {
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = await this.store.query('submission-activity', {
      'filter[subcase][:id:]': subcase.id,
      'page[size]': 500,
      include: 'pieces', // Make sure we have all pieces, unpaginated
    });
    const pieces = [];
    for (const submissionActivity of submissionActivities.toArray()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.toArray();
      pieces.push(...submissionPieces);
    }
    return pieces;
  },

  async copySubcaseProperties(subcase, latestSubcase, copyFullSubcase = false) {
    const pieces = await this.fetchSubcasePieces(latestSubcase);
    if (copyFullSubcase) {
      const subcaseName = await latestSubcase.get('subcaseName');
      const linkedPieces = await latestSubcase.get('linkedPieces');
      const accessLevel = await latestSubcase.get('accessLevel');
      subcase.set('linkedPieces', linkedPieces);
      subcase.set('subcaseName', subcaseName);
      subcase.set('accessLevel', accessLevel);
      subcase.set('showAsRemark', latestSubcase.showAsRemark);
      const submissionActivity = this.store.createRecord('submission-activity', {
        startDate: new Date(),
        pieces,
      });
      await submissionActivity.save();
      subcase.get('submissionActivities').pushObject(submissionActivity);
    } else {
      subcase.set('linkedPieces', pieces);
    }
    const mandatees = await latestSubcase.get('mandatees');
    subcase.set('mandatees', mandatees);
    const iseCodes = await latestSubcase.get('iseCodes');
    subcase.set('iseCodes', iseCodes);
    const requestedBy = await latestSubcase.get('requestedBy');
    subcase.set('requestedBy', requestedBy);
    return await subcase.save();
  },

  createSubcaseObject(newCase, newDate) {
    const {
      type, title, shortTitle, confidential, showAsRemark,
    } = this;
    return this.store.createRecord('subcase', {
      type,
      shortTitle: trimText(shortTitle),
      title: trimText(title),
      confidential,
      showAsRemark: showAsRemark || false,
      case: newCase,
      created: newDate,
      modified: newDate,
      isArchived: false,
      agendaActivities: [],
    });
  },

  async copySubcase(fullCopy = false) {
    const caze = await this.store.findRecord('case', this.case.id);
    const latestSubcase = await caze.get('latestSubcase');
    const date = moment().utc()
      .toDate();
    let subcase = await this.createSubcaseObject(caze, date);
    subcase.set('subcaseName', this.subcaseName);

    if (latestSubcase) { // Previous "versions" of this subcase exist
      subcase = await this.copySubcaseProperties(subcase, latestSubcase, fullCopy);
    } else { // This is a plain new subcase
      subcase = await subcase.save();
    }
    await caze.hasMany('subcases').reload();
    return subcase;
  },

  actions: {
    closeModal() {
      this.closeModal();
    },

    typeChanged(id) {
      const type = this.store.peekRecord('case-type', id);
      if (type.get('id') === CONFIG.remarkId) {
        this.set('showAsRemark', true);
      } else {
        this.set('showAsRemark', false);
      }
    },

    toggleIsEditing() {
      this.toggleProperty('isEditing');
    },

    async copyFullSubcase() {
      this.set('isLoading', true);
      const subcase = await this.copySubcase(true);
      this.set('item', subcase);
      this.set('isLoading', false);
      this.refresh();
    },

    async createSubCase(event) {
      event.preventDefault();
      this.set('isLoading', true);
      const subcase = await this.copySubcase(false);
      this.set('item', subcase);
      this.set('isLoading', false);
      this.refresh();
    },

    selectType(type) {
      this.set('type', type);
    },

    selectModel(items) {
      this.set('selectedSubcaseName', items);
      this.set('subcaseName', items.get('label'));
    },
  },
});
