import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { startOfDay } from 'date-fns';

/**
 * @argument subcase
 * @argument agendaitem
 * @argument newsItem
 * @argument onSave
 * @argument onCancel
 */
export default class AgendaitemCaseSidebarEdit extends Component {
  @service pieceAccessLevelService;
  @service agendaitemAndSubcasePropertiesSync;

  confidentialChanged = false;
  propertiesToSet = Object.freeze(['title', 'shortTitle', 'comment']);

  @service store;
  @service conceptStore;
  @service router;
  @service mandatees;

  @tracked filter = Object.freeze({
    type: 'subcase-name',
  });
  @tracked agendaItemTypes;
  @tracked title;
  @tracked shortTitle;
  @tracked confidential;

  @tracked agendaItemType;
  @tracked selectedShortcut;
  @tracked subcaseName;
  @tracked type;
  @tracked latestSubcase;
  @tracked isEditing = false;

  @tracked case;
  @tracked publicationFlows;

  @tracked currentMinisters = [];
  @tracked selectedMinisterIds = [];
  @tracked selectedCurrentMinisterIds = [];
  @tracked pastMinisters = [];
  @tracked pastMinistersHidden = true;
  @tracked selectedPastMinisterIds = [];
  @tracked showAllAreas = false;
  @tracked showAgendaModal = false;
  @tracked hasAgenda = false;

  @tracked newPieces = A([]);

  constructor() {
    super(...arguments);
    this.loadAgendaItemTypes.perform();
    this.loadTitleData.perform();
    this.prepareMinisters.perform();
  }

  get newsItem() {
    return this.args.newsItem;
  }

  @action
  cancelEditing() {
    if (this.args.agendaitem.hasDirtyAttributes) {
      this.args.agendaitem.rollbackAttributes();
    }
    // We change the value of confidental directly on subcase, so we should also roll it back
    if (this.args.subcase?.hasDirtyAttributes) {
      this.args.subcase.rollbackAttributes();
    }
    if (this.newsItem && this.newsItem.hasDirtyAttributes) {
      this.newsItem.rollbackAttributes();
    }
    this.args.onCancel();
  }

  @task
  *saveChanges() {
    const shouldResetFormallyOk = this.args.agendaitem.hasDirtyAttributes;

    const trimmedTitle = trimText(this.args.agendaitem.title);
    const trimmedShortTitle = trimText(this.args.agendaitem.shortTitle);

    const propertiesToSetOnAgendaitem = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
    };
    const propertiesToSetOnSubcase = {
      title: trimmedTitle,
      shortTitle: trimmedShortTitle,
      confidential: this.args.subcase?.confidential,
    };

    yield this.agendaitemAndSubcasePropertiesSync.saveChanges(
      this.args.agendaitem,
      propertiesToSetOnAgendaitem,
      propertiesToSetOnSubcase,
      shouldResetFormallyOk,
    );
    if (this.confidentialChanged && (this.args.subcase && this.args.subcase.confidential)) {
      yield this.pieceAccessLevelService.updateDecisionsAccessLevelOfSubcase(this.args.subcase);
      yield this.pieceAccessLevelService.updateSubmissionAccessLevelOfSubcase(this.args.subcase);
    }

    if (this.newsItem) {
      const agendaItemType = yield this.args.agendaitem.type;
      const isAnnouncement = agendaItemType.uri === CONSTANTS.AGENDA_ITEM_TYPES.ANNOUNCEMENT;
      if (isAnnouncement) {
        // Keep generated newsItem for announcement automatically in sync
        this.newsItem.htmlContent = trimmedTitle;
        this.newsItem.title = trimmedShortTitle;
        yield this.newsItem.save();
      } else if (this.newsItem.hasDirtyAttributes) {
        yield this.newsItem.save();
      }
    }
    this.args.onSave();
  }

  get selectedMinisterIds() {
    return this.args.selected === null ? [] : this.args.selected;
  }

  get selectedCurrentMinisters() {
    return this.selectedCurrentMinisterIds.map((ministerId) =>
      this.currentMinisters.find((minister) => minister.id === ministerId)
    );
  }

  get selectedPastMinisters() {
    return this.selectedPastMinisterIds.map((ministerId) =>
      this.pastMinisters.find((minister) => minister.id === ministerId)
    );
  }

  get selectedCurrentMinistersName() {
    return this.selectedCurrentMinisterIds.map((ministerLabel) =>
      this.currentMinisters.find((minister) => minister.fullName === ministerLabel)
    );
  }

  @action
  onChangeCurrentMinisters(selected) {
    this.selectedCurrentMinisterIds = selected.map((m) => m.id)
    this.onChangeMinisters();
  }

  @action
  onChangeMinisters() {
    this.args.onChange?.(this.selectedCurrentMinisterIds);
  }

  @action
  onChangePastMinisters(selected) {
    this.selectedPastMinisterIds = selected.map((m) => m.id)
    this.onChangeMinisters();
  }

  @task
  *prepareMinisters() {
    yield this.prepareCurrentMinisters.perform();
    if (this.args.showPastMinisters) {
      yield this.preparePastMinisters.perform();
    }
  }

  @task
  *prepareCurrentMinisters() {
    const currentMandatees = yield this.mandatees.getMandateesActiveOn.perform(startOfDay(new Date()));
    const sortedMandatees = currentMandatees
          .sort((m1, m2) => m1.priority - m2.priority)
    const sortedMinisters = yield Promise.all(
      sortedMandatees.map((m) => m.person)
    );
    this.currentMinisters = [...new Set(sortedMinisters)];
    this.selectedCurrentMinisterIds = this.selectedMinisterIds.filter((ministerId) => this.currentMinisters.find((minister) => minister.id === ministerId));
  }

  @task
  *preparePastMinisters() {
    const allMinisters = yield this.store.queryAll('person', {
      'filter[:has:mandatees]': true,
      sort: 'last-name'
    });
    this.pastMinisters = allMinisters
      .filter((minister) => !this.currentMinisters.includes(minister))
      .filter((minister) => minister.uri.startsWith('http://themis.vlaanderen.be'));
    this.selectedPastMinisterIds = this.selectedMinisterIds.filter((ministerId) => this.pastMinisters.find((minister) => minister.id === ministerId));
  }

  @task
  *loadAgendaItemTypes() {
    this.agendaItemTypes = yield this.conceptStore.queryAllByConceptScheme(CONSTANTS.CONCEPT_SCHEMES.AGENDA_ITEM_TYPES);
    this.agendaItemType = yield this.store.findRecordByUri('concept', CONSTANTS.AGENDA_ITEM_TYPES.NOTA);
  }

  @task
  *loadLatestSubcase() {
    this.latestSubcase = yield this.store.queryOne('subcase', {
      filter: {
        'decisionmaking-flow': {
          ':id:': this.args.decisionmakingFlow.id,
        },
      },
      sort: '-created',
    });
  }

  @task
  *loadTitleData() {
    yield this.loadLatestSubcase.perform();
    if (this.latestSubcase) {
      this.title = this.latestSubcase.title;
      this.shortTitle = this.latestSubcase.shortTitle;
      this.confidential = this.latestSubcase.confidential;
    } else {
      const _case = yield this.args.decisionmakingFlow.case;
      this.title = _case.title;
      this.shortTitle = _case.shortTitle;
      this.confidential = false;
    }
  }

  get areLoadingTasksRunning() {
    return (
      this.loadAgendaItemTypes.isRunning ||
      this.loadLatestSubcase.isRunning ||
      this.loadTitleData.isRunning
    );
  }

  @action
  selectType(type) {
    this.type = type;
  }

  @action
  selectSubcaseName(shortcut) {
    this.selectedShortcut = shortcut;
    this.subcaseName = shortcut.label;
  }

  @action
  onChangeAgendaItemType(selectedType) {
    this.agendaItemType = selectedType;
  }

  @action
  toggleIsEditing() {
    this.isEditing = !this.isEditing;
  }

  @task
  *loadData() {
    this.case = yield this.args.decisionmakingFlow.case;
    this.publicationFlows = yield this.case.publicationFlows;
  }

  @action
  transitionBack() {
    if (history.length > 1) {
      history.back();
    }
  }

  @action
  scrollIntoView(element) {
    element.scrollIntoView({
      behavior: 'smooth', block: 'start',
    });
  }

  @action
  toggleAreas() {
    this.showAllAreas = !this.showAllAreas;
  }

  @action
  toggleAgendaModal() {
    this.showAgendaModal = !this.showAgendaModal;
  }

  @action
  toggleAgenda() {
    this.hasAgenda = true;
  }

  @tracked isJanJambon = false;

  @action
  toggleJanJambon() {
    this.isJanJambon = !this.isJanJambon;
  }

  @tracked isHildeCrevits = false;

  @action
  toggleHildeCrevits() {
    this.isHildeCrevits = !this.isHildeCrevits;
  }

  @tracked isBartSomers = false;

  @action
  toggleBartSomers() {
    this.isBartSomers = !this.isBartSomers;
  }

  @tracked isBenWeyts = false;

  @action
  toggleBenWeyts() {
    this.isBenWeyts = !this.isBenWeyts;
  }

  @tracked isZuhalDemir = false;

  @action
  toggleZuhalDemir() {
    this.isZuhalDemir = !this.isZuhalDemir;
  }

  @tracked isMatthiasDiepenDaele = false;

  @action
  toggleMatthiasDiepenDaele() {
    this.isMatthiasDiepenDaele = !this.isMatthiasDiepenDaele;
  }

  @tracked isLydiaPeeters = false;

  @action
  toggleLydiaPeeters() {
    this.isLydiaPeeters = !this.isLydiaPeeters;
  }

  @tracked isBenjaminDalle = false;

  @action
  toggleBenjaminDalle() {
    this.isBenjaminDalle = !this.isBenjaminDalle;
  }

  @tracked isJoBrouns = false;

  @action
  toggleJoBrouns() {
    this.isJoBrouns = !this.isJoBrouns;
  }

  JanJambon = [
    {
      'fullName': 'Buitenlandse Zaken',
    },
    {
      'fullName': 'Cultuur',
    },
    {
      'fullName': 'Digitalisering',
    },
    {
      'fullName': 'Facilitair Management',
    }
  ]

  HildeCrevits = [
    {
      'fullName': 'Openbare Werken',
    },
    {
      'fullName': 'Energie',
    },
    {
      'fullName': 'Leefmilieu',
    },
    {
      'fullName': 'Natuur',
    }
  ]

  BartSomers = [
    {
      'fullName': 'Binnenlands Bestuur',
    },
    {
      'fullName': 'Bestuurszaken',
    },
    {
      'fullName': 'Inburgering',
    },
    {
      'fullName': 'Gelijke kansen',
    }
  ]

  BenWeyts = [
    {
      'fullName': 'Mobiliteit',
    },
    {
      'fullName': 'Openbare Werken',
    },
    {
      'fullName': 'Vlaamse Rand',
    },
    {
      'fullName': 'Toerisme',
    },
    {
      'fullName': 'Dierenwelzijn',
    }
  ]

  ZuhalDemir = [
    {
      'fullName': 'Justitie en handhaving',
    },
    {
      'fullName': 'Omgeving',
    },
    {
      'fullName': 'Energie',
    },
    {
      'fullName': 'Toerisme',
    }
  ]

  MatthiasDiepenDaele = [
    {
      'fullName': 'Financiën',
    },
    {
      'fullName': 'Begroting',
    },
    {
      'fullName': 'Wonen',
    },
    {
      'fullName': 'Onroerend Erfgoed',
    }
  ]

  LydiaPeeters = [
    {
      'fullName': 'Begroting',
    },
    {
      'fullName': 'Financiën',
    },
    {
      'fullName': 'Energie',
    }
  ]

  BenjaminDalle = [
    {
      'fullName': 'Brussel',
    },
    {
      'fullName': 'Jeugd',
    },
    {
      'fullName': 'Media',
    }
  ]

  JoBrouns = [
    {
      'fullName': 'Economie',
    },
    {
      'fullName': 'Innovatie',
    },
    {
      'fullName': 'Werk',
    },
    {
      'fullName': 'Sociale Economie',
    },
    {
      'fullName': 'Landbouw'
    }
  ]
}
