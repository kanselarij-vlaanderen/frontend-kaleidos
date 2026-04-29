import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';

export default class MonitoringDataPropagationController extends Controller {
  queryParams = [
    {
      page: {
        type: 'number',
      },
    },
    {
      size: {
        type: 'number',
      },
    },
    {
      sort: {
        type: 'string',
      },
    },
  ];

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[1];
  @tracked sort = '-created';

  nextPage = () => (this.page += 1);
  prevPage = () => (this.page -= 1);

  getTargetGraphLabel = async (distributorJob) => {
    const targetGraph = distributorJob.targetGraph;
    return `${targetGraph.replace('http://mu.semte.ch/graphs/organizations/', 'Propagatie ')} graph`;
  };

  getMeetingsForJob = async (distributorJob) => {
    const agendas = await distributorJob.agendas;

    const meetings = [];
    for (const agenda of agendas) {
      const meeting = await agenda.createdFor;
      if (!meetings.includes(meeting)) {
        meetings.push(meeting);
      }
    }

    const sortedMeetings = meetings
      ?.slice()
      .sort((a1, a2) => a1.plannedStart - a2.plannedStart)
      .reverse();
    return sortedMeetings;
  };
}
