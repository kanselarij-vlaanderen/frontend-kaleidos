import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { hash } from 'rsvp';

export default Component.extend({
  currentSession: service(),

  classNames: ['vl-tabs', 'vl-u-reset-margin'],
  tagName: 'ul',
  activeAgendaItemSection: null,
  currentAgenda: null,

  // This computed property is only for role-based views.
  // Should show the template the user is an editor or if the meeting is final.
  shouldShowFinishedDetails: computed('currentSession.isEditor', 'currentAgenda.createdFor', async function () {
    if (this.get('currentSession.isEditor')) {
      return true;
    }

    const meeting = await this.get('currentAgenda.createdFor');
    return meeting.isFinal;
  }),

  defaultTabs: Object.freeze([
    {
      name: 'details',
      label: 'agendaitem-case'
    },
    {
      name: 'documents',
      label: 'documents'
    }
  ]),

  activeTabs: computed('currentSession.isEditor', 'agendaitem.{subcase,remarks.length}', 'shouldShowFinishedDetails', async function () {
    const activeTabs = [];
    activeTabs.push(...this.defaultTabs);

    let promises = await hash({
      commentCount: this.get('agendaitem.remarks.length'),
      shouldShowFinishedDetails: this.get('shouldShowFinishedDetails'),
      subcase: this.get('agendaitem.subcase'),
      decisions: this.get('agendaitem.subcase.decisions'),
      minutes: this.get('agendaitem.meetingRecord'),
      newsItems: this.get('agendaitem.subcase.newsletterInfo'),
    });

    const isEditor = this.currentSession.isEditor;

    if (isEditor) {
      activeTabs.push({
        name: 'comments',
        label: 'agendaitem-comment',
        pillText: promises.commentCount
      });
    }
    if (!promises.shouldShowFinishedDetails || !promises.subcase) {
      return activeTabs;
    }

    if (isEditor || promises.decisions) {
      activeTabs.push({
        name: 'decision',
        label: 'agendaitem-decision'
      })
    }
    if (isEditor || promises.minutes) {
      activeTabs.push({
        name: 'minutes',
        label: 'agendaitem-notes'
      })
    }
    if (isEditor || promises.newsItems) {
      activeTabs.push({
        name: 'news-item',
        label: 'agendaitem-bestek'
      });
    }

    if (isEditor || this.get('agendaitem.titlePress') && this.get('agendaitem.textPress')) {
      activeTabs.push({
        name: 'press-agenda',
        label: 'agendaitem-press-agenda'
      });
    }

    return activeTabs;
  }),

  actions: {
    setAgendaItemSection(value) {
      this.setAgendaItemSection(value);
    },
  },
});
