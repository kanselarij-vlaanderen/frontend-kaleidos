import Component from '@ember/component';
import {inject} from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import ModifiedMixin from 'fe-redpencil/mixins/modified-mixin';
import {computed} from '@ember/object';

export default Component.extend(isAuthenticatedMixin, ModifiedMixin, {
  classNames: ['vlc-padding-bottom--large'],
  store: inject(),
  newsletterService: inject(),
  subcase: null,
  agendaitem: null,
  isEditing: false,
  intl: inject(),
  showNewsItemIsEditedWarning: true,

  item: computed('subcase.newsletterInfo', function () {
    return this.get('subcase.newsletterInfo');
  }),

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
    async clearMessage() {
      const documents = await this.subcase.get('documents');
      const documentsOfTypeNota = [];
      await Promise.all(documents.map(document => {
        return document.get('type').then((type) => {
          if(type.label === 'Nota') {
            documentsOfTypeNota.push(document);
          }
        })
      }));

      const lastVersionOfNotas = await Promise.all(documentsOfTypeNota.map((nota) => {
        return nota.get('lastDocumentVersion');
      }));

      const mostRecentlyAddedNotaDocumentVersion = lastVersionOfNotas.sortBy('lastModified').lastObject;

      debugger;
      console.log('');
      this.set('showNewsItemIsEditedWarning', false);
    }
  }
});
