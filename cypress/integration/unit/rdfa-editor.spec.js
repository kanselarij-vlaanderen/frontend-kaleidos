/* global context, beforeEach, afterEach, it, cy */
// / <reference types="Cypress" />

// import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
// import appuniversum from '../../selectors/appuniversum.selectors';
// import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
// import utils from '../../selectors/utils.selectors';

// TODO-command
function pressRdfaButton(buttonName) {
  cy.get('button').contains(buttonName)
    .parent('button')
    .click();
}

context('rdfa editor tests', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // RDFA tests can be flaky locally when having dev tools open or when running in background (not in focus)
  it('should test the rdfa editor keypresses', () => {
    cy.visitAgendaWithLink('/vergadering/5EBA94D7751CF70008000001/kort-bestek');
    cy.get(newsletter.buttonToolbar.edit).eq(0)
      .click();

    cy.get(dependency.rdfa.editorInner).type('{ctrl+u}Underline')
      .type('{ctrl+u} ');
    cy.get('u').contains('Underline');
    cy.get(dependency.rdfa.editorInner).type('{ctrl+i}Italic')
      .type('{ctrl+i} ');
    cy.get('em').contains('Italic');
    cy.get(dependency.rdfa.editorInner).type('{ctrl+b}Bold')
      .type('{ctrl+b} ');
    cy.get('strong').contains('Bold');

    // check single backspace
    cy.get(dependency.rdfa.editorInner).type('{selectAll}{backspace}');
    cy.get(dependency.rdfa.editorInner).should('not.contain', 'Bol');
    // check single delete
    cy.get(dependency.rdfa.editorInner).type('Bold')
      .type('{selectAll}')
      .type('{del}');
    cy.get(dependency.rdfa.editorInner).should('not.contain', 'Bold');
    // check separate backspaces
    cy.get(dependency.rdfa.editorInner).type('Bold')
      .type('{end}{backspace}')
      .type('{backspace}')
      .type('{backspace}')
      .type('{backspace}');
    cy.get(dependency.rdfa.editorInner).should('not.contain', 'Bol');
    // check separate deletes
    cy.get(dependency.rdfa.editorInner).type('Bold')
      .type('{home}{del}')
      .type('{del}')
      .type('{del}')
      .type('{del}');
    cy.get(dependency.rdfa.editorInner).should('not.contain', 'old');
    cy.get(newsletter.editItem.cancel).click();

    // check enter
    cy.get(newsletter.buttonToolbar.edit).eq(0)
      .click();
    cy.get(dependency.rdfa.editorInner).find('br')
      .should('have.length', 1); // 1 br exists by default
    cy.get(dependency.rdfa.editorInner).type('{enter}');
    cy.get(dependency.rdfa.editorInner).find('br')
      .should('have.length', 2);
    // check space
    cy.get(dependency.rdfa.editorInner).clear()
      .type(' ');
    cy.get(dependency.rdfa.editorInner).should('contain', ' ');
    cy.get(dependency.rdfa.editorInner).should('not.contain', '\u00a0');
    // check that there are no &nbsp;
    // see: https://github.com/lblod/ember-rdfa-editor/pull/245
    cy.get(dependency.rdfa.editorInner).clear()
      .type('test  test');
    cy.get(dependency.rdfa.editorInner).should('contain', ' ');
    cy.get(dependency.rdfa.editorInner).should('not.contain', '\u00a0');
    cy.get(newsletter.editItem.cancel).click();
  });

  it('should test the rdfa editor buttonpresses', () => {
    cy.visitAgendaWithLink('/vergadering/5EBA94D7751CF70008000001/kort-bestek');
    cy.intercept('GET', '/themes**').as('getThemes');
    cy.get(newsletter.buttonToolbar.edit).eq(0)
      .click();
    cy.wait('@getThemes');

    pressRdfaButton('Doorstreept');
    cy.get(dependency.rdfa.editorInner).type('Strikethrough');
    cy.wait(200);
    pressRdfaButton('Doorstreept');
    cy.get(dependency.rdfa.editorInner).type(' ');
    pressRdfaButton('Onderstreept');
    cy.get(dependency.rdfa.editorInner).type('Underline');
    cy.wait(200);
    pressRdfaButton('Onderstreept');
    cy.get(dependency.rdfa.editorInner).type(' ');
    pressRdfaButton('Schuingedrukt');
    cy.get(dependency.rdfa.editorInner).type('Italic');
    cy.wait(200);
    pressRdfaButton('Schuingedrukt');
    cy.get(dependency.rdfa.editorInner).type(' ');
    pressRdfaButton('Vetgedrukt');
    cy.get(dependency.rdfa.editorInner).type('Bold');

    cy.get('del').contains('Strikethrough');
    cy.get('u').contains('Underline');
    cy.get('em').contains('Italic');
    cy.get('strong').contains('Bold');
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItems1');
    cy.get(newsletter.editItem.save).click();
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchNewsItems1');

    cy.intercept('PATCH', '/news-items/*').as('patchNewsItems2');
    cy.get(newsletter.tableRow.newsletterRow).eq(0)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click()
      .wait('@patchNewsItems2');
  });

  it('should test the kort bestek and agendaitem views visually', () => {
    cy.visitAgendaWithLink('/vergadering/5EBA94D7751CF70008000001/kort-bestek');
    cy.get(newsletter.tableRow.newsletterRow).eq(0)
      .as('firstRowZebra');

    cy.get('@firstRowZebra').find('strong')
      .should('have.css', 'font-weight', '500');
    cy.get('@firstRowZebra').find('em')
      .should('have.css', 'font-style', 'italic');
    cy.get('@firstRowZebra').find('u')
      .should('have.css', 'text-decoration', 'underline solid rgb(42, 45, 49)');
    cy.get('@firstRowZebra').find('del')
      .should('have.css', 'text-decoration', 'line-through solid rgb(42, 45, 49)');

    cy.clickReverseTab('Klad');
    cy.get(newsletter.newsletterPrint.htmlContent).eq(0)
      .as('firstRowKlad');

    cy.get('@firstRowKlad').find('strong')
      .should('have.css', 'font-weight', '500');
    cy.get('@firstRowKlad').find('em')
      .should('have.css', 'font-style', 'italic');
    cy.get('@firstRowKlad').find('u')
      .should('have.css', 'text-decoration', 'underline solid rgb(42, 45, 49)');
    cy.get('@firstRowKlad').find('del')
      .should('have.css', 'text-decoration', 'line-through solid rgb(42, 45, 49)');

    cy.clickReverseTab('Definitief');
    cy.get(newsletter.newsletterPrint.htmlContent).eq(0)
      .as('firstRowDefinitief');

    cy.get('@firstRowDefinitief').find('strong')
      .should('have.css', 'font-weight', '500');
    cy.get('@firstRowDefinitief').find('em')
      .should('have.css', 'font-style', 'italic');
    cy.get('@firstRowDefinitief').find('u')
      .should('have.css', 'text-decoration', 'underline solid rgb(42, 45, 49)');
    cy.get('@firstRowDefinitief').find('del')
      .should('have.css', 'text-decoration', 'line-through solid rgb(42, 45, 49)');

    cy.visitAgendaWithLink('/vergadering/5EBA94D7751CF70008000001/agenda/5EBA94D8751CF70008000002/agendapunten/5EBA9512751CF70008000008/kort-bestek');
    cy.get(newsletter.agendaitemNewsItem.content).as('agendaitemNewsItemContent');
    cy.get('@agendaitemNewsItemContent').find('strong')
      .should('have.css', 'font-weight', '500');
    cy.get('@agendaitemNewsItemContent').find('em')
      .should('have.css', 'font-style', 'italic');
    cy.get('@agendaitemNewsItemContent').find('u')
      .should('have.css', 'text-decoration', 'underline solid rgb(42, 45, 49)');
    cy.get('@agendaitemNewsItemContent').find('del')
      .should('have.css', 'text-decoration', 'line-through solid rgb(42, 45, 49)');

    cy.visit('/kort-bestek/zoeken');
    cy.get(route.search.input).type('Cypress test: 20+ documents agendaitem with subcase - 1589286110');
    cy.get(route.search.trigger).click();
    cy.get(route.searchNewsletters.row.title).eq(0)
      .as('searchResultContent');
    cy.get('@searchResultContent').find('strong')
      .should('have.css', 'font-weight', '500');
    cy.get('@searchResultContent').find('em')
      .should('have.css', 'font-style', 'italic');
    cy.get('@searchResultContent').find('u')
      .should('have.css', 'text-decoration', 'underline solid rgb(42, 45, 49)');
    cy.get('@searchResultContent').find('del')
      .should('have.css', 'text-decoration', 'line-through solid rgb(42, 45, 49)');
  });
});
