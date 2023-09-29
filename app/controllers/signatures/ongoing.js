import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { PAGINATION_SIZES } from 'frontend-kaleidos/config/config';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SignaturesOngoingController extends Controller {
  @service router;
  @service mandatees;
  @service intl;
  @service currentSession;
  @service signatureService;

  queryParams = [
    {
      page: {
        type: 'number',
      },
      size: {
        type: 'number',
      },
      sort: {
        type: 'string',
      },
      mandatees: {
        type: 'array',
      },
      statuses: {
        type: 'array',
      }
    },
  ];

  mockupData = [
    {
      name: 'VR 2023 1509 DOC.1180-2 BVR Strategische Cultuur- en Jeugdinfrastructuur - BVR.pdf',
      type: 'BVR',
      date: '22-06-2023',
      ministers: 'Jan Jambon, Benjamin Dalle',
      admin: 'Dorien Ivens',
      status: 'Voor te bereiden'
    },
    {
      name: 'VR 2023 0809 DOC.1139-2 Wijziging schoolregeling - BVRBIS.pdf',	
      type: 'BVR',	
      date: '08-09-23',	
      ministers: 'Jan Jambon, Hilde Crevits, Ben Weyts, Jo Brouns',	
      admin: 'Dorien Ivens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 0809 DOC.1140-2 WijzigingVPSSA2020-2022 - BVR.pdf',	
      type: 'BVR', 	
      date: '08-09-23',	
      ministers: 'Jan Jambon, Bart Somers',	
      admin: 'Annick Quintens',	
      status: 'Voor te bereiden',
    },
    {
      name: 'VR 2023 0809 DOC.1140-4 WijzigingVPSSA2020-2022 - bijlage.pdf',	
      type: 'Bijlage',	
      date: '08-09-23',	
      ministers: 'Jan Jambon, Bart Somers',	
      admin: 'Annick Quintens',	
      status: 'Voor te bereiden',
    },
    {
      name: 'VR 2023 0809 DOC.1140-5 WijzigingVPSSA2020-2022 - bijlage.pdf',	
      type: 'Bijlage',	
      date: '08-09-23',	
      ministers: 'Jan Jambon, Bart Somers',	
      admin: 'Dorien Ivens',	
      status: 'Te ondertekenen',
    },
    {
      name: "VR 2023 0809 DOC.1144-2 Subsidie voormalige pilootregio's - BVRBIS.pdf",
      type: 'BVR', 	
      date: '08-09-23',	
      ministers: 'Jan Jambon, Ben Weyts, Lydia Peeters',	
      admin: 'Dorien Ivens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 0809 DOC.1161-2 Decreet digitale transformatie - BVR.pdf',	
      type: 'BVR', 	
      date: '08-09-23',	
      ministers: 'Jan Jambon, Ben Weyts, Benjamin Dalle',	
      admin: 'Dorien Ivens',	
      status: 'Te ondertekenen',
    },
    {
      name: "VR 2023 3108 DOC.1117-2 Wijziging ASB's Sectoraal Akkoord 2020 - 2022 - BVRBIS.pdf",	
      type: 'BVR',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Hilde Crevits, Zuhal Demir, Lydia Peeters, Jo Brouns',	
      admin: 'Dorien Ivens',	
      status: 'Te ondertekenen',
    },
    {
      name: "VR 2023 3108 DOC.1117-3 Wijziging ASB's Sectoraal Akkoord 2020 - 2022 - bijlageBIS.pdf",	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Hilde Crevits, Zuhal Demir, Lydia Peeters, Jo Brouns',	
      admin: 'Dorien Ivens',	
      status: 'Te ondertekenen',
    },
    {
      name: 'VR 2023 3108 MED.0309-2 Herverdeling FC0-1FBD2AA-PR - Technische correctie - BVR.pdf',	
      type: 'BVR',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Matthias Diependaele',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-2 Opleidingsprofielen VWO - BVR.pdf',	
      type: 'BVR',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-3 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-4 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-5 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-6 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-7 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-8 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-9 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-10 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-11 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-12 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    },
    {
      name: 'VR 2023 3108 DOC.1134-13 Opleidingsprofielen VWO - bijlage.pdf',	
      type: 'Bijlage',	
      date: '31-08-23',	
      ministers: 'Jan Jambon, Ben Weyts, Jo Brouns',	
      admin: 'Annick Quintens',	
      status: 'Getekend',
    }
  ]

  @tracked page = 0;
  @tracked size = PAGINATION_SIZES[3];
  @tracked sort = '-decision-activity.start-date';
  @tracked isLoadingModel;
  @tracked mandatees = [];
  @tracked statuses = [];
  @tracked excludedStatuses = [CONSTANTS.SIGNFLOW_STATUSES.MARKED]


  isConfidential = (accessLevel) => {
    return [
      CONSTANTS.ACCESS_LEVELS.INTERN_SECRETARIE,
      CONSTANTS.ACCESS_LEVELS.VERTROUWELIJK,
    ].includes(accessLevel.get('uri'));
  }

  @action
  async navigateToSignFlow (signFlow) {
    const signSubcase = await signFlow.signSubcase;
    const signMarkingActivity = await signSubcase.signMarkingActivity;
    const piece = await signMarkingActivity.piece;
    const status = await signFlow.status;

    if (piece) {
      if (status.uri === CONSTANTS.SIGNFLOW_STATUSES.MARKED
          || status.uri === CONSTANTS.SIGNFLOW_STATUSES.SIGNED
          || status.uri === CONSTANTS.SIGNFLOW_STATUSES.REFUSED
          || status.uri === CONSTANTS.SIGNFLOW_STATUSES.CANCELED) {
        window.open(`/document/${piece.id}`, '_blank');
      } else {
        const signingHubUrl = await this.signatureService.getSigningHubUrl(signFlow, piece);
        if (signingHubUrl) {
          window.open(signingHubUrl, '_blank');
        } else {
          window.open(`/document/${piece.id}`, '_blank');
        }
      }
    }
  }

  @action
  onChangeStatus(statuses) {
    this.statuses = statuses;
  }

  @action
  setMandatees(mandatees) {
    this.mandatees = mandatees;
  }

  getMandateeNames = async (signFlow) => {
    const signSubcase = await signFlow.signSubcase;
    const signSigningActivities = await signSubcase.signSigningActivities;
    const mandatees = await Promise.all(
      signSigningActivities.map((activity) => activity.mandatee)
    );
    const persons = await Promise.all(
      mandatees
        .toArray()
        .sort((m1, m2) => m1.priority - m2.priority)
        .map((mandatee) => mandatee.person)
    );
    return persons.map((person) => person.fullName);
  }
}
