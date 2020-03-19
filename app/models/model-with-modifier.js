import DS from 'ember-data';
import { inject } from '@ember/service';
import moment from "moment";
import EmberObject from '@ember/object';
import ModelWithToasts from 'fe-redpencil/models/model-with-toasts';
import fetch from 'fetch';
import ModifiedOldDataError from '../errors/modified-old-data-error';

let { attr, belongsTo } = DS;

export default ModelWithToasts.extend({
  currentSession: inject(),
  intl: inject(),
  globalError: inject(),
  modified: attr('datetime'),
  modifiedBy: belongsTo('user'),

  async save() {
    const parentSave = this._super;
    const dirtyType = this.get('dirtyType');

    switch (dirtyType) {
      case 'created': {
        break;
      }

      case 'deleted': {
        return parentSave.call(this, ...arguments);
      }
      case undefined: {
        await this.preEditOrSaveCheck();
        break;
      }
      case 'updated': {
        await this.preEditOrSaveCheck();
        this.globalError.showToast.perform(EmberObject.create({
          title: this.intl.t('successfully-created-title'),
          message: this.intl.t('successfully-saved'),
          type: 'success'
        }));
        break;
      }
    }
    this.set('modified', moment().utc().toDate());
    await this.currentSession.get('user').then((user) => {
      this.set('modifiedBy', user);
    });
    return parentSave.call(this, ...arguments);
  },

  async preEditOrSaveCheck() {
    if (! await this.saveAllowed()) {
      const { oldModelData, oldModelModifiedMoment } = await this.getOldModelData();
      const userId = oldModelData.data[0]['relationships']['modified-by']['links']['self'];
      const userData = await fetch(userId);
      const userDataFields = await userData.json();
      const vals = userDataFields.data.attributes;
      this.globalError.showToast.perform(EmberObject.create({
        title: this.intl.t('changes-could-not-be-saved-title'),
        message: this.intl.t('changes-could-not-be-saved-message', {
          firstname: vals['first-name'],
          lastname: vals['last-name'],
          time: oldModelModifiedMoment.locale("nl").fromNow()
        }),
        type: 'error'
      }), 600000);
      let e = new ModifiedOldDataError();
      e.message = 'Editing concurrency protection. Data in the db was altered under your feet.';
      throw (e);
    }
  },

  async saveAllowed() {
    const modified = this.get('modified');
    const modifiedBy = await this.get('modifiedBy');
    const currentModifiedModel = moment.utc(this.get('modified'));
    const { oldModelData, oldModelModifiedMoment } = await this.getOldModelData();
    // Deze test test eigenlijk of het item hetzelfde is:
    // item is hetzelfde
    // Indien modified nog niet bestaat (old data)
    // Indien modifiedBy nog niet bestaat (old data)
    // Indien    de modified van het huidige model currentModifiedModel
    //           == de modified van het model op DB oldModelModifiedMoment
    const allowSave = (typeof modified == 'undefined' || modifiedBy == null ||
      (
        typeof modified != 'undefined'
        && currentModifiedModel.isSame(oldModelModifiedMoment)
        && typeof oldModelData.data[0]['relationships']['modified-by'] != 'undefined')
    );
    return allowSave;
  },

  async getOldModelData() {
    const oldModelData = await this.store.adapterFor(this.get('constructor.modelName'))
      .queryRecord(this.store, this.get('constructor'),
        {
          filter:
            { id: this.get('id') }
        });
    const oldModelModifiedMoment = moment.utc(oldModelData.data[0].attributes.modified);
    return { oldModelData, oldModelModifiedMoment };
  }
});
