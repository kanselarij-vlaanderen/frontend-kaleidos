import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { KALEIDOS_START_DATE } from 'frontend-kaleidos/config/config';

export default class Meeting extends Model {
  @service intl;

  @attr uri;
  @attr('datetime') plannedStart;
  @attr('datetime') startedOn;
  @attr('datetime') endedOn;
  @attr location;
  @attr('number') number;
  @attr numberRepresentation;
  @attr extraInfo;

  @belongsTo('concept', { inverse: null, async: true }) kind;
  @belongsTo('meeting', {
    inverse: null,
    async: true,
  })
  mainMeeting;
  @belongsTo('mail-campaign', { inverse: 'meeting', async: true }) mailCampaign; // mail-campaign is read-only to prevent concurrency issues
  @belongsTo('agenda', { inverse: 'meeting', async: true }) agenda; // The final agenda for this meeting, not saved on agenda side

  @belongsTo('internal-decision-publication-activity', {
    inverse: 'meeting',
    async: true,
  })
  internalDecisionPublicationActivity;
  @belongsTo('internal-document-publication-activity', {
    inverse: 'meeting',
    async: true,
  })
  internalDocumentPublicationActivity;
  @belongsTo('minutes', {
    inverse: 'minutesForMeeting',
    async: true,
  })
  minutes;

  @hasMany('themis-publication-activity', { inverse: 'meeting', async: true })
  themisPublicationActivities;
  @hasMany('agenda', { inverse: 'createdFor', async: true }) agendas; // All agendas for this meeting, includes the final agenda
  @hasMany('piece', { inverse: 'meeting', async: true, polymorphic: true }) pieces;

  get isPreKaleidos() {
    return this.plannedStart < KALEIDOS_START_DATE;
  }
}
