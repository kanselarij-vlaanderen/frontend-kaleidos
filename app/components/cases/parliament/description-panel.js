import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class CasesParliamentDescriptionPanelComponent extends Component {
  @service store;

  @tracked latestMeeting;
  @tracked publicationStatus;
  @tracked latestPublicationActivity;

  constructor() {
    super(...arguments);
    this.loadStatusData.perform();
  }

  loadStatusData = task(async () => {
    const generatedSubcase = await this.args.latestRetrievalActivity?.generatedSubcase;

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
          include: 'agenda'
        });
      }
    }

    const latestPublicationActivity = await this.store.queryOne(
      'publication-activity',
      {
        'filter[subcase][publication-flow][case][decisionmaking-flow][:id:]':
          this.args.decisionmakingFlow.id,
        sort: '-start-date',
      }
    );

    const publicationStatus = await this.store.queryOne('publication-status', {
      'filter[publications][case][decisionmaking-flow][:id:]':
        this.args.decisionmakingFlow.id,
    });

    this.publicationStatus = publicationStatus;
    this.latestMeeting = latestMeeting;
    this.latestPublicationActivity = latestPublicationActivity;
  });

  get parliamentCaseLink() {
    return `https://www.vlaamsparlement.be/nl/parlementaire-documenten/parlementaire-initiatieven/${this.args.parliamentFlow.parliamentId}`;
  }
}
