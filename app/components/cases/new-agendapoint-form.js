import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { A } from '@ember/array';
import { startOfDay } from 'date-fns';
import { TrackedArray } from 'tracked-built-ins';

export default class CasesNewAgendapointForm extends Component {
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

  @tracked showNotifiersModal = false;
  @tracked notificationAddresses = new TrackedArray([]);

  @tracked newPieces = A([]);

  constructor() {
    super(...arguments);
    this.loadAgendaItemTypes.perform();
    this.loadTitleData.perform();
    this.prepareMinisters.perform();
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

  get areSavingTasksRunning() {
    return this.copyFullSubcase.isRunning || this.saveSubcase.isRunning;
  }

  async loadSubcasePieces(subcase) {
    // 2-step procees (submission-activity -> pieces). Querying pieces directly doesn't
    // work since the inverse isn't present in API config
    const submissionActivities = await this.store.query('submission-activity', {
      'filter[subcase][:id:]': subcase.id,
      'page[size]': PAGE_SIZE.CASES,
      include: 'pieces', // Make sure we have all pieces, unpaginated
    });
    const pieces = [];
    for (const submissionActivity of submissionActivities.toArray()) {
      let submissionPieces = await submissionActivity.pieces;
      submissionPieces = submissionPieces.toArray();
      pieces.push(...submissionPieces);
    }
    return pieces;
  }

  @action
  async createSubcase(fullCopy) {
    const date = new Date();

    const subcase = this.store.createRecord('subcase', {
      type: this.type,
      shortTitle: trimText(this.shortTitle),
      title: trimText(this.title),
      confidential: this.confidential,
      agendaItemType: this.agendaItemType,
      decisionmakingFlow: this.args.decisionmakingFlow,
      created: date,
      modified: date,
      isArchived: false,
      subcaseName: this.subcaseName,
      agendaActivities: [],
    });

    let piecesFromSubmissions;
    if (this.latestSubcase) {
      // Previous "versions" of this subcase exist
      piecesFromSubmissions = await this.loadSubcasePieces(this.latestSubcase);
      await this.copySubcaseProperties(
        subcase,
        this.latestSubcase,
        fullCopy,
        piecesFromSubmissions
      );
    }
    // We save here in order to set the belongsTo relation between submission-activity and subcase
    await subcase.save();
    // reload the list of subcases on case, list is not updated automatically
    await this.args.decisionmakingFlow.hasMany('subcases').reload();

    if (this.latestSubcase && fullCopy) {
      await this.copySubcaseSubmissions(subcase, piecesFromSubmissions);
    }
    return;
  }

  @action
  async copySubcaseProperties(subcase, latestSubcase, fullCopy, pieces) {
    const type = await subcase.type;
    const subcaseTypeWithoutMandatees = [
      CONSTANTS.SUBCASE_TYPES.BEKRACHTIGING,
    ].includes(type?.uri);
    // Everything to copy from latest subcase
    if (!subcaseTypeWithoutMandatees) {
      subcase.mandatees = await latestSubcase.mandatees;
      subcase.requestedBy = await latestSubcase.requestedBy;
    }
    if (fullCopy) {
      subcase.linkedPieces = await latestSubcase.linkedPieces;
      subcase.subcaseName = latestSubcase.subcaseName;
      subcase.agendaItemType = await latestSubcase.agendaItemType;
      subcase.confidential = latestSubcase.confidential;
    } else {
      subcase.linkedPieces = pieces;
    }
    subcase.governmentAreas = await latestSubcase.governmentAreas;
    return subcase;
  }

  @action
  async copySubcaseSubmissions(subcase, pieces) {
    const submissionActivity = this.store.createRecord('submission-activity', {
      startDate: new Date(),
      pieces: pieces,
      subcase,
    });
    await submissionActivity.save();
    return;
  }

  @task
  *copyFullSubcase() {
    yield this.createSubcase(true);
    this.args.onCreate();
  }

  @task
  *saveSubcase() {
    this.router.transitionTo('cases');
    this.args.onCreate();
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

  agendas = [
    {
      'title': 'Ontwerpagenda',
      'letter': 'B',
      'created': '14-07-2023'
    },
    {
      'title': 'Ontwerpagenda',
      'letter': 'B',
      'created': '22-06-2023'
    },
    {
      'title': 'Ontwerpagenda',
      'letter': 'B',
      'created': '22-06-2023'
    },
    {
      'title': 'Ontwerpagenda',
      'letter': 'D',
      'created': '29-05-2023'
    },
    {
      'title': 'Ontwerpagenda',
      'letter': 'A',
      'created': '15-05-2023'
    },
    {
      'title': 'Ontwerpagenda',
      'letter': 'D',
      'created': '26-04-2023'
    },
    {
      'title': 'Ontwerpagenda',
      'letter': 'A',
      'created': '18-01-2023'
    }
  ]


  @action
  uploadPiece(file) {
    const now = new Date();
    const documentContainer = this.store.createRecord('document-container', {
      created: now,
    });
    const piece = this.store.createRecord('piece', {
      created: now,
      modified: now,
      file: file,
      accessLevel: this.defaultAccessLevel,
      name: file.filenameWithoutExtension,
      documentContainer: documentContainer,
    });
    this.newPieces.pushObject(piece);
  }

  @task
  *addPiece(piece, signFlow) {
    const shouldReplaceSignFlow = !!signFlow;
    if (shouldReplaceSignFlow) {
      yield this.signatureService.removeSignFlow(signFlow);
    }
    yield piece.save();
    if (shouldReplaceSignFlow) {
      yield this.signatureService.markDocumentForSignature(piece, this.decisionActivity);
    }
    yield this.pieceAccessLevelService.updatePreviousAccessLevel(piece);
    try {
      const sourceFile = yield piece.file;
      yield this.fileConversionService.convertSourceFile(sourceFile);
    } catch (error) {
      this.toaster.error(
        this.intl.t('error-convert-file', { message: error.message }),
        this.intl.t('warning-title'),
      );
    }
    yield this.updateRelatedAgendaitemsAndSubcase.perform([piece]);
  }

  @task
  *cancelUploadPieces() {
    const deletePromises = this.newPieces.map((piece) =>
      this.deletePiece.perform(piece)
    );
    yield all(deletePromises);
    this.newPieces = A();
    this.isOpenPieceUploadModal = false;
  }

  @task
  *cancelAddPiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    yield piece.destroyRecord();
  }

  @task
  *deletePiece(piece) {
    const file = yield piece.file;
    yield file.destroyRecord();
    this.newPieces.removeObject(piece);
    const documentContainer = yield piece.documentContainer;
    yield documentContainer.destroyRecord();
    yield piece.destroyRecord();
  }

  @action
  saveNotificationAddress(address) {
    this.notificationAddresses.addObject(address);
    this.showNotifiersModal = false;
  }

  @action
  removeNotificationAddress(address) {
    this.notificationAddresses.removeObject(address);
  }
}
