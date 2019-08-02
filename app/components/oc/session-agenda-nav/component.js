import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Component.extend(isAuthenticatedMixin, {
	routing: service('-routing'),
	tagName: 'ul',
	classNames: ['vlc-toolbar__item'],
	activeClass: 'vlc-tabs-reverse__link--active',
	
	selectedItem: undefined,

	inOverview: computed('routing.currentRouteName', function () {
		return this.routing.get('currentRouteName') === "oc.meetings.meeting.agendaitems.index";
	}),

	inDetail: computed('routing.currentRouteName', function () {
		return this.routing.get('currentRouteName') === "oc.meetings.meeting.agendaitems.agendaitem.index";
	}),

});
