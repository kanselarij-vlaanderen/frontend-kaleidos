import Component from '@glimmer/component';
import { trackedFunction } from 'reactiveweb/function';


/**
 * @argument {PublicationFlow} publicationFlow (publication-flow,publication-flow.mandatees,publication-flow.mandatees.person)
 * @argument {Mandatee} submitter (subcase.requested-by)
 */
export default class PublicationsPublicationCaseMandateesAndSubmitterPanelComponent extends Component {

  mandatees = trackedFunction(this, async () => {
    const mandateesPromise = this.args.publicationFlow.mandatees;
    const mandatees = await mandateesPromise;
    return mandatees.slice();
  });
}
