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

  @tracked showCCModal = false;
  @tracked CCAddresses = new TrackedArray([]);

  @tracked newPieces = A([]);

  constructor() {
    super(...arguments);
    this.loadAgendaItemTypes.perform();
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

  get areLoadingTasksRunning() {
    return this.loadAgendaItemTypes.isRunning;
  }

  @task
  *saveSubcase() {
    this.router.transitionTo('cases.submissions');
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

  @action
  saveCCAddress(address) {
    this.CCAddresses.addObject(address);
    this.showCCModal = false;
  }

  @action
  removeCCAddress(address) {
    this.CCAddresses.removeObject(address);
  }
}
