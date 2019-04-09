import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
	store: inject(),
	isManagingAlerts: null,
	isAdding: false,
	isEditing: false,

	title: computed('selectedAlert', {
		get() {
			const alert = this.get('selectedAlert');
			if (alert) {
				return alert.get('title');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	message: computed('selectedAlert', {
		get() {
			const alert = this.get('selectedAlert');
			if (alert) {
				return alert.get('message');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	beginDate: computed('selectedAlert', {
		get() {
			const alert = this.get('selectedAlert');
			if (alert) {
				return alert.get('beginDate');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	endDate: computed('selectedAlert', {
		get() {
			const alert = this.get('selectedAlert');
			if (alert) {
				return alert.get('endDate');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

	type: computed('selectedAlert', {
		get() {
			const alert = this.get('selectedAlert');
			if (alert) {
				return alert.get('type');
			} else {
				return null;
			}
		},
		set(key, value) {
			return value;
		}
	}),

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
			if(selectedAlert) {
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
			const { selectedAlert, beginDate, endDate, type } = this;
			const alertToSave = this.store.peekRecord('alert', selectedAlert.get('id'));
			alertToSave.set('beginDate',beginDate );
			alertToSave.set('endDate', endDate);
			alertToSave.set('type', type);
			alertToSave.save().then(() => {
				alertToSave.reload();
				this.toggleProperty('isEditing');
				this.clearProperties();
			});
		},

		createAlert() {
			const { title,type, message, beginDate, endDate } = this;

			const alert = this.store.createRecord('alert', {
				title: title,
				message: message,
				beginDate: beginDate,
				endDate: endDate,
				type:type
			});
			alert.save().then(() => {
				this.clearProperties();
				this.set('isAdding', false);
			});
		}
	}
});
