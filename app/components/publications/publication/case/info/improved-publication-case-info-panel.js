import Component from '@glimmer/component';
import { service } from '@ember/service';
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

  loadData = task(async () => {
    this.isViaCouncilOfMinisters = await this.publicationService.getIsViaCouncilOfMinisters(this.args.publicationFlow);

    const identification = await this.args.publicationFlow.identification;
    const structuredIdentifier = await identification.structuredIdentifier;
    this.publicationNumber = await structuredIdentifier?.localIdentifier;

    this.numacNumbers = await this.args.publicationFlow.numacNumbers;
    const publicationStatus = await this.args.publicationFlow.status
    if (publicationStatus.isPublished) {
      const publicationActivity = await this.store.queryOne('publication-activity', {
        'filter[subcase][publication-flow][:id:]': this.args.publicationFlow.id,
        sort: '-end-date'
      });
      if (publicationActivity?.endDate) {
        const latestDecisionPublicationDate = format(new Date(publicationActivity.endDate), 'yyyy-MM-dd');
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
  });
}
