import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import moment from 'moment';


export default Route.extend({
  sessionService: inject(),

  model(params) {
    const agendaitem_id = params.agendaitem_id;
    return this.store.findRecord('agendaitem', agendaitem_id, {
      include: 'subcase'
    });
  },

  async afterModel(model) {
    const subcase = await model.get('subcase');
    const result = await this.shouldShowEditedWarning(subcase);
    this.set('sessionService.selectedAgendaItem', model);
    this.set('sessionService.showNewsItemIsEditedWarning', result);
  },

  async shouldShowEditedWarning(subcase) {
    const newsletterInfoForSubcase = await subcase.get('newsletterInfo');
    const documents = await subcase.get('documents');
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
        return true;
        // this.set('showNewsItemIsEditedWarning', true);
      } else {
        return false;
        // this.set('showNewsItemIsEditedWarning', false);
      }
    } else {
      return true;
      // this.set('showNewsItemIsEditedWarning', true);
    }
  },


    actions: {
    refreshRoute() {
      this._super(...arguments);
      this.refresh();
    }
  }
});
