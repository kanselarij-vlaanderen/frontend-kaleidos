import Component from '@glimmer/component';
import { tracked }  from '@glimmer/tracking';
import { action } from '@ember/object';

export default class DomainFilterComponent extends Component {
  currentDomains = [
    {
      fullName: 'Welzijn, Volksgezondheid en Gezin'
    },
    {
      fullName: 'Economie, Wetenschap en Innovatie'
    },
    {
      fullName: 'Landbouw en Visserij'
    },
    {
      fullName: 'Werk & sociale economie'
    },
    {
      fullName: 'Mobiliteit en Openbare Werken'
    },
    {
      fullName: 'Kanselarij, Bestuur, Buitenlandse Zaken en Justitie'
    },
    {
      fullName: 'Onderwijs en Vorming'
    },
    {
      fullName: 'Financiën en Begroting'
    },
    {
      fullName: 'Cultuur, Jeugd, Sport en Media'
    },
    {
      fullName: 'Omgeving'
    }
  ];
  @tracked pastDomains = [
    {
      fullName: 'Kanselarij en Bestuur'
    },
    {
      fullName: 'Internationaal Vlaanderen'
    },
    {
      fullName: 'Buitenlands Beleid, Buitenlandse Handel, Internationale Samenwerking en Toerisme'
    },
    {
      fullName: 'Leefmilieu, Natuur en Energie'
    },
    {
      fullName: 'Diensten Algemeen Regeringsbeleid'
    },
    {
      fullName: 'Ruimtelijke Ordening, Woonbeleid en Onroerend Erfgoed'
    },
    {
      fullName: 'Bestuurszaken'
    }
  ];
  @tracked pastDomainsHidden = true;
}
