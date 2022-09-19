/* global context, it, cy, afterEach */
// / <reference types="Cypress" />

import auk from '../../selectors/auk.selectors';
import document from '../../selectors/document.selectors';

// TODO-command could be command
// function selectFromDropdown(item) {
//   cy.get(dependency.emberPowerSelect.option, {
//     timeout: 5000,
//   }).wait(500)
//     .contains(item)
//     .scrollIntoView()
//     .trigger('mouseover')
//     .click({
//       force: true,
//     });
//   cy.get(dependency.emberPowerSelect.option, {
//     timeout: 15000,
//   }).should('not.exist');
// }

// TODO-command could be command
// function selectConfidentialityLevel(docName, confLevel) {
//   cy.get(document.documentCard.name.value).contains(docName)
//     .parents(document.documentCard.card)
//     .find(document.accessLevelPill.edit)
//     .click();
//   cy.get(document.accessLevelPill.selector)
//     .click();
//   selectFromDropdown(confLevel);
//   // TODO randomint
//   // cy.intercept('PATCH', '/pieces/**').as('patchPieces1');
//   cy.get(document.accessLevelPill.save).click();
//   // cy.wait('@patchPieces10');
// }

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
  const docName1 = 'VR 2022 2004 DOC.0001-01 propagatie intern secretarie';
  const docName2 = 'VR 2022 2004 DOC.0001-02 propagatie vertrouwelijk';
  const docName3 = 'VR 2022 2004 DOC.0001-03 propagatie intern regering';
  const docName4 = 'VR 2022 2004 DOC.0001-04 propagatie intern overheid';
  const docName5 = 'VR 2022 2004 DOC.0001-05 propagatie publiek';

  const subcaseTitle2 = 'test propagatie vertrouwelijkheid locked 1655729512';
  // const agendaitem2Link = 'vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten/62B06EECEC3CB8277FF058F3/documenten';
  const docNameLocked1 = 'VR 2022 2004 DOC.0002-01 propagatie vertrouwelijk intern secretarie';
  const docNameLocked2 = 'VR 2022 2004 DOC.0002-02 propagatie vertrouwelijk vertrouwelijk';
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

  it('login as kanselarij and check access', () => {
    cy.login('Kanselarij');
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
    cy.wait(60000);
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
  });

  it('login as kabinet and check access', () => {
    cy.login('Kabinet');
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
  });

  it('login as overheid and check access', () => {
    cy.login('Overheid');
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
  });
});
