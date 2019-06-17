import Component from '@ember/component';

export default Component.extend({

	actions: {
		selectUser(user) {
			this.set('selectedUser', user);
		},

		close() {
			const user = this.get('selectedUser');
			if (user) {
				user.belongsTo('group').reload();
			}
			this.close();
		},

		chooseAccountGroup(newGroup) {
			const user = this.get('selectedUser');
			user.set('group', newGroup);
		},

		saveChanges() {
			this.set('isLoading', true);
			this.get('selectedUser').save().then(() => {
				this.set('isLoading', false);
				this.close();
			});
		},

		removeUserRoles() {
			const user = this.get('selectedUser');
			user.set('group', null);
		}
	}
});
