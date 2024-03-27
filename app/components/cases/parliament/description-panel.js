import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class CasesParliamentDescriptionPanelComponent extends Component {
  @service store;

  @tracked latestMeeting;

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

    this.latestMeeting = latestMeeting;
  });
}
