import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class CasesCaseSubcasesAddSubcaseController extends Controller {
  @tracked decisionmakingFlow;
  @tracked latestSubcase;
}
