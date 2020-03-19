import Component from '@ember/component';
import {inject} from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import {computed} from '@ember/object';
import moment from 'moment';

export default Component.extend(isAuthenticatedMixin, ModifiedMixin, {
  classNames: ['vlc-padding-bottom--large'],
  store: inject(),
  newsletterService: inject(),
  subcase: null,
  agendaitem: null,
  isEditing: false,
  intl: inject(),
  showNewsItemIsEditedWarning: false,

  didInsertElement() {
    this._super(...arguments);
    this.shouldShowEditedWarning();
  },

  item: computed('subcase.newsletterInfo', function () {
    return this.get('subcase.newsletterInfo');
  }),

  async shouldShowEditedWarning() {
    const newsletterInfoForSubcase = await this.subcase.get('newsletterInfo');
    const documents = await this.get('subcase.documents');
    if (!documents) {
      return;
    }
    const documentsOfTypeNota = [];
    await Promise.all(documents.map(document => {
      return document.get('type').then((type) => {
        if (type.label === 'Nota') {
          documentsOfTypeNota.push(document);
        }
      })
    }));

    const lastVersionOfNotas = await Promise.all(documentsOfTypeNota.map((nota) => {
      return nota.get('lastDocumentVersion');
    }));

    const mostRecentlyAddedNotaDocumentVersion = lastVersionOfNotas.sortBy('lastModified').lastObject;
    const modifiedDateFromMostRecentlyAddedNotaDocumentVersion = mostRecentlyAddedNotaDocumentVersion.modified;

    const newsletterInfoOnSubcaseLastModifiedTime = newsletterInfoForSubcase.modified;
    if (newsletterInfoOnSubcaseLastModifiedTime) {
      if (moment(newsletterInfoOnSubcaseLastModifiedTime).isBefore(moment(modifiedDateFromMostRecentlyAddedNotaDocumentVersion))) {
        this.set('showNewsItemIsEditedWarning', true);
      } else {
        this.set('showNewsItemIsEditedWarning', false);
      }
    } else {
      this.set('showNewsItemIsEditedWarning', true);
    }
  },

  actions: {
    async toggleIsEditing() {
      this.set('isLoading', true);
      const subcase = await this.get('subcase');
      const newsletter = await subcase.get('newsletterInfo');
      if (!newsletter) {
        await this.newsletterService.createNewsItemForSubcase(subcase, this.agendaitem);
      }
      this.set('isLoading', false);
      this.toggleProperty('isEditing');
    },

    async saveChanges(subcase) {
      this.set('isLoading', true);
      const newsItem = await subcase.get('newsletterInfo');

      await newsItem.save().then(async () => {
        await this.updateModifiedProperty(await this.get('agendaitem.agenda'));
        this.set('isLoading', false);
        this.toggleProperty('isEditing');
      })
    },
    async clearShowNewsItemIsEditedWarning() {
      this.set('showNewsItemIsEditedWarning', false);
    },
  }
});
