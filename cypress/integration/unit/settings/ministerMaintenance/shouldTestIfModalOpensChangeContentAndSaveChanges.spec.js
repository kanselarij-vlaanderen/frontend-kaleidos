/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />

import settings from "../../../../selectors/settings.selectors";
import toolbar from "../../../../selectors/toolbar.selectors";

context('Settings: Maintain ministers', () => {

  const ministerFunctions = [
    'Minister-president van de Vlaamse Regering',
    'Vlaams minister voor onderwijs',
    'Vlaams minister van Binnenlands Bestuur, Inburgering, Wonen, Gelijke Kansen en Armoedebestrijding',
    'Vlaams minister van Mobiliteit, Openbare Werken, Vlaamse Rand, Toerisme en Dierenwelzijn',
    'Vlaams minister van Welzijn, Volksgezondheid en Gezin',
    'Vlaams minister van Werk, Economie, Innovatie en Sport',
    'Vlaams minister van Cultuur, Media, Jeugd en Brussel',
    'Vlaams minister van Begroting, Financiën en Energie',
    'Vlaams minister van Omgeving, Natuur en Landbouw'
  ];

  const availableMinisters = [
    'Geert Bourgeois',
    'Hilde Crevits',
    'Liesbeth Homans',
    'Ben Weyts',
    'Jo Vandeurzen',
    'Phillipe Muyters',
    'Sven Gatz',
    'Lydia Peeters',
    'Koen Van den Heuvel',
  ];

  const tableValues = [
    'Geert Bourgeois, Minister-president van de Vlaamse Regering',
    'Hilde Crevits, Vlaams minister voor onderwijs',
    'Liesbeth Homans, Vlaams minister van Binnenlands Bestuur, Inburgering, Wonen, Gelijke Kansen en Armoedebestrijding',
    'Ben Weyts, Vlaams minister van Mobiliteit, Openbare Werken, Vlaamse Rand, Toerisme en Dierenwelzijn',
    'Jo Vandeurzen, Vlaams minister van Welzijn, Volksgezondheid en Gezin',
    'Phillipe Muyters, Vlaams minister van Werk, Economie, Innovatie en Sport',
    'Sven Gatz, Vlaams minister van Cultuur, Media, Jeugd en Brussel',
    'Lydia Peeters, Vlaams minister van Begroting, Financiën en Energie',
    'Koen Van den Heuvel, Vlaams minister van Omgeving, Natuur en Landbouw'
  ];



  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.get(toolbar.settings).click();
    cy.get(settings.manageMinisters).click();
    cy.url().should('include','instellingen/ministers');
  });

  it('Should open the edit window on each element, change the content and save, reopen and validate that changes have been saved', () => {

    cy.get(settings.addMinister).should('be.visible');
    // TODO all of this is data dependant, the default selection filters out old ministers so this list is blank with current data set
    // cy.get(sortableGroupSelector).should('be.visible');
    // cy.get(sortableGroupRowSelector).should('have.length', 9);
    // for (let index = 0; index < 9; index++) {
    //   cy.get(sortableGroupRowSelector).eq(index).get(mandateeFullDisplayNameSelector).eq(index).should('contain.text', tableValues[index]);
    //   cy.get(sortableGroupRowSelector).eq(index).get(mandateeEditSelector).eq(index).should('be.visible').click();
    //   cy.get(sortableGroupRowSelector)
    //     .eq(index)
    //     .get(formInputSelector)
    //     .eq(0)
    //     .should('be.visible')
    //     .should('contain.value', ministerFunctions[index]);

    //   cy.get(sortableGroupRowSelector)
    //     .eq(index)
    //     .get(formInputSelector)
    //     .eq(1)
    //     .should('be.visible')
    //     .should('contain.value', '');

    //   cy.get('.ember-power-select-selected-item').should('contain.text', availableMinisters[index]);
    //   cy.selectDate('2017','2','16',0);
    //   cy.selectDate('2020','2','18',1);
    //   cy.get(iseCodesSelector).click();
    //   cy.get('.ember-power-select-option').eq(0).should('contain.text', 'Aanbodzijde woningmarkt - QQ').click();
    //   cy.get(formSaveSelector).click();
    // }
  });
});
