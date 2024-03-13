import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { setNotYetFormallyOk } from 'frontend-kaleidos/utils/agendaitem-utils';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { A } from '@ember/array';
import {
  keepLatestTask,
  task,
  all,
  timeout
} from 'ember-concurrency';
import {
  addPieceToAgendaitem, restorePiecesFromPreviousAgendaitem
} from 'frontend-kaleidos/utils/documents';

export default class CasesCaseSubcasesSubcaseIndexController extends Controller {
  constructor() {
    super(...arguments);
  }
}
