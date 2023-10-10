import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { trimText } from 'frontend-kaleidos/utils/trim-util';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { A } from '@ember/array';


export default class CasesNewSubcaseForm extends Component {
  @service store;
  @service conceptStore;
  @service router;

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

  @tracked newPieces = A([]);

  constructor() {
    super(...arguments);
    this.loadAgendaItemTypes.perform();
    this.loadTitleData.perform();
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
    yield this.createSubcase(false);
    this.router.transitionTo('cases.case.subcases');
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

  // Mock data
  currentMinisters = [
    {
      fullName: 'Jan Jambon, Minister-president van de Vlaamse Regering'
    },
    {
      fullName: 'Jan Jambon, Vlaams minister van Buitenlandse Zaken, Cultuur, Digitalisering en Facilitair Management'
    },
    {
      fullName: 'Hilde Crevits, Vlaams minister van Welzijn, Volksgezondheid en Gezin'
    },
    {
      fullName: ' Bart Somers, Vlaams minister van Binnenlands Bestuur, Bestuurszaken, Inburgering en Gelijke Kansen'
    },
    {
      fullName: 'Ben Weyts, Vlaams minister van Onderwijs, Sport, Dierenwelzijn en Vlaamse Rand'
    },
    {
      fullName: 'Zuhal Demir, Vlaams minister van Justitie en Handhaving, Omgeving, Energie en Toerisme'
    },
    {
      fullName: 'Matthias Diependaele, Vlaams minister van Financiën en Begroting, Wonen en Onroerend Erfgoed'
    },
    {
      fullName: 'Lydia Peeters, Vlaams minister van Mobiliteit en Openbare Werken'
    },
    {
      fullName: 'Benjamin Dalle, Vlaams minister van Brussel, Jeugd, Media en Armoedebestrijding'
    },
    {
      fullName: 'Jo Brouns, Vlaams minister van Economie, Innovatie, Werk, Sociale Economie en Landbouw'
    }
  ];

  culture = [
    {
      fullName: 'Cultuur'
    },
    {
      fullName: 'Jeugd'
    },
    {
      fullName: 'Media'
    },
    {
      fullName: 'Sport'
    }
  ];
  economy = [
    {
      fullName: 'Economie'
    },
    {
      fullName: 'Wetenschappelijk onderzoek'
    },
    {
      fullName: 'Innovatie'
    },
    {
      fullName: 'Wetenschapscommunicatie'
    }
  ];
  finances = [
    {
      fullName: 'Budgettair beleid'
    },
    {
      fullName: 'Fiscaliteit'
    },
    {
      fullName: 'Financiële operaties'
    },
    {
      fullName: 'Boekhouding'
    }
  ];
  governance = [
    {
      fullName: 'Ondersteuning Vlaamse Regering'
    },
    {
      fullName: 'Buitenlands beleid'
    },
    {
      fullName: 'Ontwikkelingssamenwerking'
    },
    {
      fullName: 'Gelijke kansen en integratie en inburgering'
    },
    {
      fullName: 'Brussel'
    },
    {
      fullName: 'Vlaamse rand'
    },
    {
      fullName: 'Binnenlands bestuur en stedenbeleid'
    },
    {
      fullName: 'Rampenschade'
    },
    {
      fullName: 'Digitalisering'
    },
    {
      fullName: 'Bestuursrechtspraak'
    },
    {
      fullName: 'Justitie en handhaving'
    },
    {
      fullName: 'Interne dienstverlening Vlaamse overheid'
    },
    {
      fullName: 'Toerisme'
    },
    {
      fullName: 'Internationaal ondernemen'
    },
    {
      fullName: 'Interne dienstverlening Vlaamse overheid'
    }
  ];
  agriculture = [
    {
      fullName: 'Landbouw en zeevisserij'
    },
    {
      fullName: 'Landbouw- en zeevisserijonderzoek'
    },
    {
      fullName: 'Promotie landbouw, tuinbouw en zeevisserij'
    }
  ];
  mobility = [
    {
      fullName: 'Regionale luchthavens'
    },
    {
      fullName: 'Gemeenschappelijk vervoer'
    },
    {
      fullName: 'Algemeen mobiliteitsbeleid'
    },
    {
      fullName: 'Weginfrastructuur en beleid'
    },
    {
      fullName: 'Waterinfrastructuur en beleid'
    }
  ];
  environment = [
    {
      fullName: 'Onroerend erfgoed'
    },
    {
      fullName: 'Omgeving en natuur'
    },
    {
      fullName: 'Klimaat'
    },
    {
      fullName: 'Energie'
    },
    {
      fullName: 'Dierenwelzijn'
    },
    {
      fullName: 'Wonen'
    }
  ];
  education = [
    {
      fullName: 'Kleuter- en leerplichtonderwijs'
    },
    {
      fullName: 'Hoger onderwijs'
    },
    {
      fullName: 'Deeltijds kunstonderwijs en volwassenenonderwijs'
    },
    {
      fullName: 'Ondersteuning van het onderwijsveld'
    }
  ];
  health = [
    {
      fullName: 'Welzijn'
    },
    {
      fullName: 'Gezondheids- en woonzorg'
    },
    {
      fullName: 'Opgroeien'
    },
    {
      fullName: 'Personen met een beperking'
    },
    {
      fullName: 'Sociale bescherming'
    },
    {
      fullName: 'Zorginfrastructuur'
    }
  ];
  work = [
    {
      fullName: 'Werk'
    },
    {
      fullName: 'Competenties'
    },
    {
      fullName: 'Sociale economie'
    }
  ];

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
}
