import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { cached } from 'fe-redpencil/decorators/cached';

export default Component.extend({
  store: inject(),
  isManagingAlerts: null,
  isAdding: false,
  isEditing: false,

  item: computed('selectedAlert', function () {
    return this.get('selectedAlert') || this.store.createRecord('alert', {});
  }),

  title: cached('item.title'), // TODO in class syntax use as a decorator instead
  message: cached('item.message'), // TODO in class syntax use as a decorator instead
  beginDate: cached('item.beginDate'), // TODO in class syntax use as a decorator instead
  endDate: cached('item.endDate'), // TODO in class syntax use as a decorator instead
  type: cached('item.type'), // TODO in class syntax use as a decorator instead

  clearProperties() {
    this.set('title', null);
    this.set('message', null);
    this.set('beginDate', null);
    this.set('endDate', null);
    this.set('type', null);
  },

  actions: {
    close() {
      this.toggleProperty('isManagingAlerts');
    },

    selectBeginDate(date) {
      this.set('beginDate', date);
    },

    selectEndDate(date) {
      this.set('endDate', date);
    },

    selectType(type) {
      this.set('type', type);
    },

    selectAlert(alert) {
      this.set('selectedAlert', alert);
    },

    toggleIsAdding() {
      this.toggleProperty('isAdding');
    },

    async toggleIsEditing() {
      const { selectedAlert } = this;
      if (selectedAlert) {
        const alert = this.store.peekRecord('alert', selectedAlert.get('id'));
        await alert.rollbackAttributes();
      }
      this.toggleProperty('isEditing');
    },

    removeAlert() {
      const alert = this.get('selectedAlert');
      if (!alert) {
        return;
      }
      alert.destroyRecord();
      this.set('selectedAlert', null);
    },

    editAlert() {
      this.set('isLoading', true);
      const { selectedAlert, beginDate, title, message, endDate, type } = this;
      const alertToSave = this.store.peekRecord('alert', selectedAlert.get('id'));
      alertToSave.set('beginDate', beginDate);
      alertToSave.set('title', title);
      alertToSave.set('message', message);
      alertToSave.set('endDate', endDate);
      alertToSave.set('type', type);
      alertToSave.save().then(() => {
        alertToSave.reload();
        this.toggleProperty('isEditing');
        this.set('isLoading', false);
        this.clearProperties();
      });
    },

    createAlert() {
      this.set('isLoading', true);
      const { title, type, message, beginDate, endDate } = this;

      const alert = this.store.createRecord('alert', {
        title, message, beginDate, endDate, type
      });
      alert.save().then(() => {
        this.clearProperties();
        this.set('isLoading', false);
        this.set('isAdding', false);
      });
    }
  }
});
