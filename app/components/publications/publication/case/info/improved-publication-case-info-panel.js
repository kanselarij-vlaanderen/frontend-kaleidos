import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { format } from "date-fns";

/**
 * @argument publicationFlow
 * @argument meeting
 * @argument subcase
 */

export default class PublicationsPublicationCaseInfoImprovedPublicationCaseInfoPanelComponent extends Component {
  @service publicationService;
  @service store;

  @tracked isViaCouncilOfMinisters
  @tracked publicationNumber;
  @tracked numacNumbers;
  @tracked links = [];

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.isViaCouncilOfMinisters = yield this.publicationService.getIsViaCouncilOfMinisters(this.args.publicationFlow);

    const identification = yield this.args.publicationFlow.identification;
    const structuredIdentifier = yield identification.structuredIdentifier;
    this.publicationNumber = yield structuredIdentifier.localIdentifier;

    this.numacNumbers = yield this.args.publicationFlow.numacNumbers;
    const publicationStatus = yield this.args.publicationFlow.status
    if (publicationStatus.isPublished) {
      const publicationActivity = yield this.store.queryOne('publication-activity', {
        '[filter][subcase][publication-flow][:id:]': this.args.publicationFlow.id,
        sort: '-end-date'
      });
      if (publicationActivity) {
        const decisions = yield publicationActivity.decisions;
        const latestDecision = decisions
        .slice()
        .sort((d1, d2) => d1.publicationDate - d2.publicationDate)
        .at(-1);
        const latestDecisionPublicationDate = format(new Date(latestDecision?.publicationDate), 'yyyy-MM-dd');
        for (const numacNumber of this.numacNumbers) {
          const link = {};
          const codexBaseUrl = "https://codex.vlaanderen.be/Zoeken/Document.aspx?";
          const codexNumac = "NUMAC=" + numacNumber.idName;
          const codexParams = "&param=inhoud";
          link.hrefCodex = codexBaseUrl + codexNumac + codexParams;
    
          const gazetteBaseUrl = "https://www.ejustice.just.fgov.be/cgi/api2.pl?";
          const gazetteLanguage = "lg=nl";
          const gazettePublicationDate = "pd=" + latestDecisionPublicationDate;
          const gazetteNumac = "numac=" + numacNumber.idName;
          link.hrefGazette = gazetteBaseUrl + gazetteLanguage + "&" + gazettePublicationDate + "&" + gazetteNumac;
    
          this.links.push(link);
        }
      }
    }
  }



}