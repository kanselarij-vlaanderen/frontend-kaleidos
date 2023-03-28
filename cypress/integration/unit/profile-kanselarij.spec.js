/* global context, it, cy, beforeEach */
// / <reference types="Cypress" />

// import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
// import appuniversum from '../../selectors/appuniversum.selectors';
// import cases from '../../selectors/case.selectors';
// import document from '../../selectors/document.selectors';
// import mandatee from '../../selectors/mandatee.selectors';
// import newsletter from '../../selectors/newsletter.selectors';
import publication from '../../selectors/publication.selectors';
import route from '../../selectors/route.selectors';
// import settings from '../../selectors/settings.selectors';
import utils from '../../selectors/utils.selectors';


context('Testing the application as Kanselarij user', () => {
  beforeEach(() => {
    cy.login('Kanselarij');
  });

  context('Profile rights checks for publications routes', () => {
    it('check publications route', () => {
      cy.visit('publicaties/overzicht/alle-dossiers');

      cy.get(publication.publicationsIndex.newPublication);
      cy.get(publication.publicationsIndex.tabs.all);
      cy.get(publication.publicationsIndex.tabs.urgent);
      cy.get(publication.publicationsIndex.tabs.translations);
      cy.get(publication.publicationsIndex.tabs.proof);
      cy.get(publication.publicationsIndex.tabs.proofread);
      cy.get(publication.publicationsIndex.tabs.late);
      // cy.get(publication.publicationsIndex.tabs.reports);
      // cy.get(publication.publicationsIndex.tabs.search);

      cy.get(publication.publicationsIndex.tabs.reports).click();
      cy.get(auk.loader).should('not.exist');
      cy.get(publication.reportsPanelEntry.create).should('not.be.disabled');

      cy.get(publication.publicationsIndex.tabs.search).click();
      cy.get(auk.loader).should('not.exist');
      cy.get(route.search.input);
      cy.get(route.search.trigger);
    });

    it('check publications/publication route', () => {
      cy.visit('publicaties/6374F718D9A98BD0A228856E/dossier');

      // main view - status
      cy.get(publication.statusPill.changeStatus);

      // case view
      cy.get(publication.publicationNav.case);
      cy.get(publication.publicationCaseInfo.edit);
      cy.get(publication.remark.edit);
      cy.get(publication.inscription.view.edit);
      cy.get(publication.mandateesPanel.add);
      cy.get(utils.governmentAreasPanel.edit);
      cy.get(publication.contactPersons.add);

      // decisions view
      cy.get(publication.publicationNav.decisions).click();
      cy.get(publication.decisionsInfoPanel.edit);
      cy.get(publication.decisionsIndex.uploadReference);

      // translations view
      cy.get(publication.publicationNav.translations).click();
      cy.get(publication.translationsInfoPanel.edit);
      cy.get(publication.translationsIndex.upload);
      cy.get(publication.translationsIndex.requestTranslation);

      // proofs view
      cy.get(publication.publicationNav.proofs).click();
      cy.get(publication.proofInfoPanel.edit);
      cy.get(publication.proofsIndex.upload);
      cy.get(publication.proofsIndex.newRequest);

      // publications view
      cy.get(publication.publicationNav.publications).click();
      cy.get(publication.publicationsInfoPanel.edit);
      cy.get(publication.publicationActivities.register);
      cy.get(publication.publicationActivities.request);
    });
  });
});
