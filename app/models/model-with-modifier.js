import DS from 'ember-data';
import { inject as service } from '@ember/service';
import moment from 'moment';
import ModelWithToasts from 'fe-redpencil/models/model-with-toasts';
import fetch from 'fetch';
import ModifiedOldDataError from '../errors/modified-old-data-error';

const {
  attr, belongsTo,
} = DS;

export default ModelWithToasts.extend({
  currentSession: service(),
  intl: service(),
  toaster: service(),
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
        this.toaster.success(this.intl.t('successfully-saved'), this.intl.t('successfully-created-title'));
        break;
      }
    }
    this.set('modified', moment().utc()
      .toDate());
    await this.currentSession.get('user').then((user) => {
      this.set('modifiedBy', user);
    });
    return parentSave.call(this, ...arguments);
  },

  async preEditOrSaveCheck() {
    if (!await this.saveAllowed()) {
      const {
        oldModelData, oldModelModifiedMoment,
      } = await this.getOldModelData();
      this.set('mustRefresh', true);
      const userId = oldModelData.data[0].relationships['modified-by'].links.self;
      const userData = await fetch(userId);
      const userDataFields = await userData.json();
      const vals = userDataFields.data.attributes;
      const errorMessage = this.intl.t('changes-could-not-be-saved-message', {
        modelName: this.intl.t(this.get('constructor.modelName')),
        firstname: vals['first-name'],
        lastname: vals['last-name'],
        time: oldModelModifiedMoment.locale('nl').fromNow(),
      });
      this.toaster.error(errorMessage,
        this.intl.t('changes-could-not-be-saved-title'),
        {
          timeOut: 600000,
        });
      const modifiedOldDataErrorException = new ModifiedOldDataError();
      modifiedOldDataErrorException.message = 'Editing concurrency protection. Data in the db was altered under your feet.';
      throw (modifiedOldDataErrorException);
    }
  },

  async saveAllowed() {
    const modified = this.get('modified');
    const modifiedBy = await this.get('modifiedBy');
    const currentModifiedModel = moment.utc(this.get('modified'));
    const mustRefresh = this.get('mustRefresh');
    if (mustRefresh) {
      return false;
    }

    const {
      oldModelData, oldModelModifiedMoment,
    } = await this.getOldModelData();
    // Deze test test eigenlijk of het item hetzelfde is:
    // item is hetzelfde
    // Indien modified nog niet bestaat (old data)
    // Indien modifiedBy nog niet bestaat (old data)
    // Indien    de modified van het huidige model currentModifiedModel
    //           == de modified van het model op DB oldModelModifiedMoment
    const allowSave = (typeof modified === 'undefined' || modifiedBy === null
      || (
        typeof modified !== 'undefined'
        && currentModifiedModel.isSame(oldModelModifiedMoment)
        && typeof oldModelData.data[0].relationships['modified-by'] !== 'undefined')
    );
    return allowSave;
  },

  async getOldModelData() {
    const oldModelData = await this.store.adapterFor(this.get('constructor.modelName'))
      .queryRecord(this.store, this.get('constructor'),
        {
          filter:
            {
              id: this.get('id'),
            },
        });
    const oldModelModifiedMoment = moment.utc(oldModelData.data[0].attributes.modified);
    return {
      oldModelData, oldModelModifiedMoment,
    };
  },
});
