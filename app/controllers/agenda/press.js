import Controller from '@ember/controller';
import { getNotaGroups } from 'frontend-kaleidos/utils/agendaitem-utils';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { task } from 'ember-concurrency';

export default class AgendaPressController extends Controller {
  getNotaGroupsTask = task(async () => {
    const notaGroups = await getNotaGroups(this.model.agendaitems);
    return notaGroups;
  });

  notaGroups = trackedTask(this, this.getNotaGroupsTask);
}
