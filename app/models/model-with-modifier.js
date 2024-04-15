import Model, { belongsTo, attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { formatDistanceToNow } from 'date-fns';
import fetch from 'fetch';
import ModifiedOldDataError from 'frontend-kaleidos/errors/modified-old-data-error';

/**
 * Abstract model which implements a form of optimistic locking for the record,
 * preventing the user from persisting edits of the record data if another user
 * persisted their edits before us.
 */
export default class ModelWithModifier extends Model {
  @service currentSession;
  @service intl;
  @service store;
  @service toaster;

  @attr('datetime') modified;
  @belongsTo('user', { inverse: null, async: true }) modifiedBy;

  setModified() {
    this.modified = new Date();
    this.modifiedBy = this.currentSession.user;
  }

  /**
   * Persist the record's data to the backend using Ember's built-in save method
   * or throw if the record's has changed in the backend before saving.
   *
   * @param {Object} options
   * @throws {ModifiedOldDataError} If the record's data was modified
   * @return {Promise} a promise that will be resolved when the adapter returns
   * successfully or rejected if the adapter returns with an error
   */
  async save(options) {
    switch (this.dirtyType) {
      case 'created': {
        this.setModified();
        break;
      }
      case 'deleted': {
        break;
      }
      // This case can occur when uploading documents on agendaitem that is already "not yet formally ok"
      // No set of formal ok status occurs on the agendaitem (not dirty), but we have added documents using PUT calls
      // We still want to change modified data to reflect that a change has happened (so other users can't save without refreshing page)
      case '': {
        // only relations are dirty (f.e. themes on newsItem)
        await this.preEditOrSaveCheck();
        this.setModified();
        break;
      }
      case undefined: {
        // only relations are dirty? this used to work but now we seem to be getting an empty string instead
        await this.preEditOrSaveCheck();
        this.setModified();
        break;
      }
      case 'updated': {
        await this.preEditOrSaveCheck();
        this.setModified();
        break;
      }
    }

    return super.save(options);
  }

  /**
   * Check if the record can be saved, otherwise show a toast and throw an error.
   *
   * @throws {ModifiedOldDataError}
   * @returns {Promise<Boolean>}
   */
  async preEditOrSaveCheck() {
    if (!(await this._saveAllowed())) {
      const { oldModelData, oldModelModified } = await this._getOldModelData();
      this.mustRefresh = true;
      const userId =
        oldModelData.data[0].relationships['modified-by'].links.self;
      const userData = await fetch(userId);
      const userDataFields = await userData.json();
      const vals = userDataFields.data.attributes;
      const errorMessage = this.intl.t('changes-could-not-be-saved-message', {
        modelName: this.intl.t(this.constructor.modelName),
        firstname: vals['first-name'],
        lastname: vals['last-name'],
        time: formatDistanceToNow(oldModelModified),
      });
      this.toaster.error(
        errorMessage,
        this.intl.t('changes-could-not-be-saved-title'),
        {
          timeOut: 60000,
        }
      );
      const modifiedOldDataErrorException = new ModifiedOldDataError();
      modifiedOldDataErrorException.message =
        'Editing concurrency protection. Data in the db was altered under your feet.';
      throw modifiedOldDataErrorException;
    }
  }

  /**
   * Check if the record can be saved. This is determined by comparing the
   * modified and modifiedBy properties of the record with the data residing in
   * the backend.
   *
   * @returns {Promise<Boolean>}
   */
  async _saveAllowed() {
    const modifiedBy = await this.modifiedBy;
    if (this.mustRefresh) {
      return false;
    }

    const { oldModelData, oldModelModified } = await this._getOldModelData();
    // If the record has no modified and modifiedBy data it's a brand new record
    // that has no backend data and we can always save it.
    // If the record's modified and modifiedBy data matches the backend data, we
    // can save the record since we wouldn't be overwriting any other changes.
    // Otherwise, disallow saving the record.
    return (
      typeof this.modified === 'undefined' ||
        modifiedBy === null ||
        (typeof this.modified !== 'undefined' &&
         this.modified.getTime() === oldModelModified.getTime() &&
         typeof oldModelData.data[0].relationships['modified-by'] !== 'undefined')
    );
  }

  /**
   * Return the record's data as it is found in the backend.
   *
   * @returns {Promise}
   */
  async _getOldModelData() {
    // We use the adapter here (via store.adapterFor) instead of the store
    // outright because we want to get the record's data, without affecting or
    // being affected by the store. E.g. store.findRecord() would just return
    // our own record since it's cached. And causing the store to reload the
    // current record might have nefarious effects since we're using the current
    // record.
    const oldModelData = await this.store
      .adapterFor(this.constructor.modelName)
      .queryRecord(this.store, this.constructor, {
        filter: {
          id: this.id,
        },
      });
    const oldModelModified = new Date(oldModelData.data[0].attributes.modified);
    return {
      oldModelData,
      oldModelModified,
    };
  }
}
