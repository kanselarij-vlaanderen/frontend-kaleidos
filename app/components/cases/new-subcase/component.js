import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';

export default Component.extend({
  store: inject(),
  newsletterService: inject(),
  classNames: ['vl-custom'],
  confidentiality: null,
  title: null,
  shortTitle: null,
  filter: Object.freeze({ type: 'subcase-name' }),

  confidential: computed('case', function () {
    return this.get('case.confidential');
  }),

  async copySubcaseProperties(subcase, latestSubcase, copyFullSubcase = false) {
    const mandatees = await latestSubcase.get('mandatees');
    const iseCodes = await latestSubcase.get('iseCodes');

    const requestedBy = await latestSubcase.get('requestedBy');
    const documentVersions = await latestSubcase.get('documentVersions');

    if (copyFullSubcase) {
      const subcaseName = await latestSubcase.get('subcaseName');
      const linkedDocumentVersions = await latestSubcase.get('linkedDocumentVersions');
      const accessLevel = await latestSubcase.get('accessLevel');
      subcase.set('documentVersions', documentVersions);
      subcase.set('linkedDocumentVersions', linkedDocumentVersions);
      subcase.set('subcaseName', subcaseName);
      subcase.set('accessLevel', accessLevel);
    } else {
      subcase.set('linkedDocumentVersions', documentVersions);
    }

    subcase.set('mandatees', mandatees);
    subcase.set('iseCodes', iseCodes);
    subcase.set('requestedBy', requestedBy);
    return await subcase.save();
  },

  async copyNewsletterInfo(subcase, newsletterInfo) {
    const newsletterInfoToCreate = this.store.createRecord('newsletter-info', {
      subcase,
      text: newsletterInfo.get('text'),
      subtitle: newsletterInfo.get('subtitle'),
      title: newsletterInfo.get('title'),
      richtext: newsletterInfo.get('richtext'),
      finished: false,
      inNewsletter: false,
      mandateeProposal: null,
      publicationDate: newsletterInfo.get('publicationDate'),
      publicationDocDate: newsletterInfo.get('publicationDocDate'),
      themes: await newsletterInfo.get('themes')
    });
    return await newsletterInfoToCreate.save();
  },

  async copyDecisions(subcase, decisions) {
    return Promise.all(
      decisions.map(decision => {
        const newDecision = this.store.createRecord('decision', {
          title: decision.get('title'),
          shortTitle: decision.get('shortTitle'),
          approved: false,
          description: decision.get('description'),
          subcase
        });
        return newDecision.save();
      })
    );
  },

  createSubcaseObject(newCase, newDate) {
    const { type, title, shortTitle, confidential, showAsRemark } = this;
    return this.store.createRecord('subcase', {
      type,
      shortTitle,
      title,
      confidential,
      showAsRemark,
      case: newCase,
      created: newDate,
      modified: newDate,
      isArchived: false,
      formallyOk: false,
      phases: []
    });
  },

  async copySubcase(fullCopy = false) {
    const caze = await this.store.findRecord('case', this.case.id);
    const latestSubcase = await caze.get('latestSubcase');
    const date = moment().utc().toDate();
    let subcase = await this.createSubcaseObject(caze, date);
    subcase.set('subcaseName', this.subcaseName);

    if (latestSubcase) {
      subcase = await this.copySubcaseProperties(subcase, latestSubcase, fullCopy);
      await this.copyDecisions(subcase, await latestSubcase.get('decisions'));
      const newsletterInfo = await latestSubcase.get('newsletterInfo');
      if (newsletterInfo) {
        await this.copyNewsletterInfo(subcase, newsletterInfo);
      }
    } else {
      await this.newsletterService.createNewsItemForSubcase(subcase);
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
    }
  }
});
