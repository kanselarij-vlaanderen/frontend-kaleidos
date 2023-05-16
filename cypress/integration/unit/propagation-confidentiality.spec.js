/* global context, it, cy, afterEach */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import document from '../../selectors/document.selectors';

function checkAccess(docName, hasAccess = true) {
  cy.get(document.documentCard.name.value).contains(docName)
    .parents(document.documentCard.card)
    .as('currentDoc');
  cy.get(auk.loader).should('not.exist');
  cy.get('@currentDoc').find(document.accessLevelPill.pill);
  if (hasAccess) {
    cy.get('@currentDoc').find(document.documentCard.name.value)
      .should('contain', '.pdf');
  } else {
    cy.get('@currentDoc').find(document.documentCard.name.value)
      .should('not.contain', '.pdf');
  }
}

context('Propagation of confidentiality setup', () => {
  // const agendaDate = Cypress.dayjs('2022-04-20').hour(10);
  // const subcaseTitle1 = 'test propagatie vertrouwelijkheid 1655729512';
  const agendaitem1Link = 'vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten/62B06EBFEC3CB8277FF058F0/documenten';
  const procedurestep1Link = 'dossiers/E14FB4F6-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/62B06D82EC3CB8277FF058D0/documenten';
  const docName1 = 'VR 2022 2004 DOC.0001-01 propagatie intern secretarie';
  const docName2 = 'VR 2022 2004 DOC.0001-02 propagatie ministerraad';
  const docName3 = 'VR 2022 2004 DOC.0001-03 propagatie intern regering';
  const docName4 = 'VR 2022 2004 DOC.0001-04 propagatie intern overheid';
  const docName5 = 'VR 2022 2004 DOC.0001-05 propagatie publiek';

  const subcaseTitle2 = 'test propagatie vertrouwelijkheid locked 1655729512';
  // const agendaitem2Link = 'vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten/62B06EECEC3CB8277FF058F3/documenten';
  const procedurestep2Link = 'dossiers/E14FB501-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/62B06DF6EC3CB8277FF058DD/documenten';
  const docNameLocked1 = 'VR 2022 2004 DOC.0002-01 propagatie vertrouwelijk intern secretarie';
  const docNameLocked2 = 'VR 2022 2004 DOC.0002-02 propagatie vertrouwelijk ministerraad';
  const docNameLocked3 = 'VR 2022 2004 DOC.0002-03 propagatie vertrouwelijk intern regering';
  const docNameLocked4 = 'VR 2022 2004 DOC.0002-04 propagatie vertrouwelijk intern overheid';
  const docNameLocked5 = 'VR 2022 2004 DOC.0002-05 propagatie vertrouwelijk publiek';

  afterEach(() => {
    cy.logoutFlow();
  });

  // setup for this spec
  // 1 approved agenda A with released decisions
  // 1 approval (not used in tests)
  // 1 agendaitem with 5 documents, 1 of each accessLevel
  // 1 agendaitem with 5 documents, 1 of each accessLevel, subcase is confidential

  it('login as OVRB and check access', () => {
    cy.login('OVRB');
    cy.visitAgendaWithLink(agendaitem1Link);
    checkAccess(docName1);
    checkAccess(docName2);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1);
    checkAccess(docNameLocked2);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);

    cy.visit(procedurestep1Link);
    checkAccess(docName1);
    checkAccess(docName2);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.visit(procedurestep2Link);
    checkAccess(docNameLocked1);
    checkAccess(docNameLocked2);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
  });

  it('login as Secretarie and check access', () => {
    cy.login('Secretarie');

    cy.visit(procedurestep1Link);
    checkAccess(docName1);
    checkAccess(docName2);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.visit(procedurestep2Link);
    checkAccess(docNameLocked1);
    checkAccess(docNameLocked2);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);

    cy.visitAgendaWithLink(agendaitem1Link);
    checkAccess(docName1);
    checkAccess(docName2);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1);
    checkAccess(docNameLocked2);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
    cy.releaseDocuments();
    // wait for yggie a bit, the next 2 profiles will succeed, enough time should have passed for overheid profile
    cy.wait(80000);
  });

  it('login as minister and check access', () => {
    cy.login('Minister');
    cy.visitAgendaWithLink(agendaitem1Link);
    checkAccess(docName1, false);
    checkAccess(docName2);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);

    cy.visit(procedurestep1Link);
    checkAccess(docName1, false);
    checkAccess(docName2);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.visit(procedurestep2Link);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
  });

  it('login as Kabinetdossierbeheerder and check access', () => {
    cy.login('Kabinetdossierbeheerder');
    cy.visitAgendaWithLink(agendaitem1Link);
    checkAccess(docName1, false);
    checkAccess(docName2);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);

    cy.visit(procedurestep1Link);
    checkAccess(docName1, false);
    checkAccess(docName2);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.visit(procedurestep2Link);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
  });

  it('login as Kabinetmedewerker and check access', () => {
    cy.login('Kabinetmedewerker');
    cy.visitAgendaWithLink(agendaitem1Link);
    checkAccess(docName1, false);
    checkAccess(docName2, false);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2, false);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);

    cy.visit(procedurestep1Link);
    checkAccess(docName1, false);
    checkAccess(docName2, false);
    checkAccess(docName3);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.visit(procedurestep2Link);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2, false);
    checkAccess(docNameLocked3);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
  });

  it('login as Overheidsorganisatie and check access', () => {
    cy.login('Overheidsorganisatie');
    cy.visitAgendaWithLink(agendaitem1Link);
    checkAccess(docName1, false);
    checkAccess(docName2, false);
    checkAccess(docName3, false);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2, false);
    checkAccess(docNameLocked3, false);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);

    cy.visit(procedurestep1Link);
    checkAccess(docName1, false);
    checkAccess(docName2, false);
    checkAccess(docName3, false);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.visit(procedurestep2Link);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2, false);
    checkAccess(docNameLocked3, false);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
  });

  it('login as Vlaams Parlement and check access', () => {
    cy.login('Vlaams Parlement');
    cy.visitAgendaWithLink(agendaitem1Link);
    checkAccess(docName1, false);
    checkAccess(docName2, false);
    checkAccess(docName3, false);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.openAgendaitemDocumentTab(subcaseTitle2);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2, false);
    checkAccess(docNameLocked3, false);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);

    cy.visit(procedurestep1Link);
    checkAccess(docName1, false);
    checkAccess(docName2, false);
    checkAccess(docName3, false);
    checkAccess(docName4);
    checkAccess(docName5);

    cy.visit(procedurestep2Link);
    checkAccess(docNameLocked1, false);
    checkAccess(docNameLocked2, false);
    checkAccess(docNameLocked3, false);
    checkAccess(docNameLocked4);
    checkAccess(docNameLocked5);
  });
});
