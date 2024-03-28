import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class CasesParliamentDescriptionPanelComponent extends Component {
  @service store;

  @tracked publciationStatus;
  @tracked latestMeeting;
  @tracked publicationStatus;
  @tracked latestPublicationActivity;
  @tracked latestRetrievalActivity;

  constructor() {
    super(...arguments);
    this.loadStatusData.perform();
  }

  loadStatusData = task(async () => {
    const latestRetrievalActivity = await this.store.queryOne(
      'parliament-retrieval-activity',
      {
        'filter[parliament-subcase][parliament-flow][:id:]':
          this.args.parliamentFlow.id,
        sort: '-start-date',
      }
    );

    const generatedSubcase = await latestRetrievalActivity?.generatedSubcase;

    let latestMeeting = null;
    if (generatedSubcase) {
      const latestAgendaActivity = await this.store.queryOne(
        'agenda-activity',
        {
          'filter[subcase][:id:]': generatedSubcase.id,
          sort: '-start-date',
        }
      );
      if (latestAgendaActivity) {
        latestMeeting = await this.store.queryOne('meeting', {
          'filter[agendas][agendaitems][agenda-activity][:id:]':
            latestAgendaActivity.id,
          sort: '-planned-start',
        });
      }
    }

    const publicationStatus = await this.store.queryOne('publication-status', {
      'filter[publications][case][parliament-flow][:id:]':
        this.args.parliamentFlow.id,
    });

    const latestPublicationActivity = await this.store.queryOne(
      'publication-activity',
      {
        '[subcase][publication-flow][case][parliament-flow][:id:]':
          this.args.parliamentFlow.id,
        sort: '-start-date',
      }
    );

    this.publicationStatus = publicationStatus;
    this.latestMeeting = latestMeeting;
    this.publicationStatus = publicationStatus;
    this.latestPublicationActivity = latestPublicationActivity;
    this.latestRetrievalActivity = latestRetrievalActivity;
  });
}
