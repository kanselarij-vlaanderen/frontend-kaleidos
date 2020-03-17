/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />

import {settingsSelector} from "../../../../selectors/toolbar/toolbarSelectors";
import {
  manageMinistersSelector, mandateeDeleteSelector,
  mandateeEditSelector,
  mandateeFullDisplayNameSelector,
  mandateeNicknameSelector,
  mandateePrioritySelector, mandateeResignSelector,
  ministerAddSelector,
  sortableGroupRowSelector,
  sortableGroupSelector
} from "../../../../selectors/settings/settingsSelectors";

context('Settings: Maintain ministers', () => {

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
    cy.route('/');
    cy.get(settingsSelector).click();
    cy.get(manageMinistersSelector).click();
    cy.url().should('include','instellingen/ministers');
  });

  it('Should check if the page has loaded successfully', () => {

    cy.get(ministerAddSelector).should('be.visible');
    // TODO all of this is data dependant, the default selection filters out old ministers so this list is blank with current data set
    // cy.get(sortableGroupSelector).should('be.visible');
    // cy.get(sortableGroupRowSelector).should('have.length',9);
    // for(let index = 0; index < 9; index++) {
    //   cy.get(sortableGroupRowSelector).eq(index).get(mandateeFullDisplayNameSelector).eq(index).should('contain.text',tableValues[index]);
    //   cy.get(sortableGroupRowSelector).eq(index).get(mandateeNicknameSelector).eq(index).should('contain.text','');
    //   cy.get(sortableGroupRowSelector).eq(index).get(mandateePrioritySelector).eq(index).should('contain.text',index+1);
    //   cy.get(sortableGroupRowSelector).eq(index).get(mandateeEditSelector).eq(index).should('be.visible');
    //   cy.get(sortableGroupRowSelector).eq(index).get(mandateeResignSelector).eq(index).should('be.visible');
    //   cy.get(sortableGroupRowSelector).eq(index).get(mandateeDeleteSelector).eq(index).should('be.visible');
    // }
  });





});
