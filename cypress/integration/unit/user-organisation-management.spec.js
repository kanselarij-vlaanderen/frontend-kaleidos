/* global context, it, cy, Cypress, beforeEach, afterEach, it */
// / <reference types="Cypress" />

// import agenda from '../../selectors/agenda.selectors';
import dependency from '../../selectors/dependency.selectors';
import route from '../../selectors/route.selectors';
import settings from '../../selectors/settings.selectors';
import utils from '../../selectors/utils.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';

function checkRoleFilterSingle(name, numberOfResults) {
  cy.contains(appuniversum.checkbox, name)
    .click();
  cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
  cy.get(utils.numberPagination.container).contains(`van ${numberOfResults}`);
  cy.contains(appuniversum.checkbox, name)
    .click();
}

context('testing user and organisation management', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });
  context('testing users index', () => {
    beforeEach(() => {
      cy.get(utils.mHeader.settings).click();
      cy.intercept('GET', '/roles/*').as('getRoles');
      cy.get(settings.settings.manageUsers).click();
      cy.get(auk.loader).should('not.exist');
      cy.wait('@getRoles');
    });

    it('check filter by organization or ID', () => {
      // filter by organization name
      cy.get(settings.organizationFilter.filter).click();
      cy.get(settings.organizationFilter.search).type('Kaleidos Test Organisatie Alternatief');
      cy.get(dependency.emberPowerSelect.option).should('not.contain', 'Even geduld aub');
      cy.get(dependency.emberPowerSelect.option).contains('Kaleidos Test Organisatie Alternatief')
        .click();
      cy.get(settings.usersIndex.row.name).should('have.length', 2);

      // remove filter
      cy.get(settings.organizationFilter.clearFilter).click();
      cy.get(utils.numberPagination.container).contains('van 13');

      // filter by organization ID
      cy.get(settings.organizationFilter.filter).click();
      cy.intercept('GET', '/user-organizations?filter=OVO0**').as('filterOrg');
      cy.get(settings.organizationFilter.search).type('OVO0')
        .wait('@filterOrg');
      cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
      cy.get(dependency.emberPowerSelect.option).eq(0)
        .click();
      cy.get(utils.numberPagination.container).contains('van 10');


      // site can throw errors which fail our test
      // // check link to OVO-code page
      // cy.get(settings.organizationFilter.ovoListLink).eq(0)
      //   .invoke('removeAttr', 'target') // dont open links in new windows by removing target (breaks cypress test).
      //   .click();
    });

    // This test seems very environment dependent. Dates are different
    it.skip('check filter by date', () => {
      const date = Cypress.dayjs();
      const dateLater = Cypress.dayjs().add(1, 'days');
      const dateEarlier = Cypress.dayjs().add(-1, 'days');

      // filter by starting date
      cy.get(settings.usersIndex.dateFilterFrom).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(dateEarlier);
      cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
      cy.get(utils.numberPagination.container).contains('van 13');

      cy.get(settings.usersIndex.dateFilterFrom).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(date);
      cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
      cy.get(utils.numberPagination.container).contains('van 13');

      cy.get(settings.usersIndex.dateFilterFrom).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(dateLater);
      cy.get(settings.usersIndex.table).contains('Geen resultaten gevonden');

      // clear starting date
      cy.get(settings.usersIndex.dateFilterFrom).find(auk.datepicker.clear)
        .click();
      cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
      cy.get(utils.numberPagination.container).contains('van 13');

      // filter by end date
      cy.get(settings.usersIndex.dateFilterTo).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(date);
      cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
      cy.get(utils.numberPagination.container).contains('van 13');

      cy.get(settings.usersIndex.dateFilterTo).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(dateLater);
      cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
      cy.get(utils.numberPagination.container).contains('van 13');

      cy.get(settings.usersIndex.dateFilterTo).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(dateEarlier);
      cy.get(settings.usersIndex.table).contains('Geen resultaten gevonden');

      // filter by daterange
      cy.get(settings.usersIndex.dateFilterFrom).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(dateEarlier);
      cy.get(settings.usersIndex.dateFilterTo).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(dateEarlier);
      cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
      cy.get(settings.usersIndex.table).contains('Geen resultaten gevonden');

      cy.get(settings.usersIndex.dateFilterFrom).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(date);
      cy.get(settings.usersIndex.dateFilterTo).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(date);
      cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
      cy.get(utils.numberPagination.container).contains('van 13');

      cy.get(settings.usersIndex.dateFilterFrom).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(dateLater);
      cy.get(settings.usersIndex.dateFilterTo).find(auk.datepicker.datepicker)
        .click();
      cy.setDateInFlatpickr(dateLater);
      cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
      // TODO should not have results but does (might use date before chosen date)
      // cy.get(settings.usersIndex.table).contains('Geen resultaten gevonden');
    });

    it('check filter by group', () => {
      checkRoleFilterSingle('Admin', 9);
      checkRoleFilterSingle('Secretarie', 12);
      checkRoleFilterSingle('Ondersteuning Vlaamse Regering en Betekeningen', 12);
      checkRoleFilterSingle('Kort bestek redactie', 12);
      checkRoleFilterSingle('Minister', 12);
      checkRoleFilterSingle('Kabinetsdossierbeheerder', 12);
      checkRoleFilterSingle('Kabinetsmedewerker', 12);
      checkRoleFilterSingle('Overheidsorganisatie', 12);
      checkRoleFilterSingle('Vlaams Parlement', 12);
    });

    it('check filter by blocked', () => {
      checkRoleFilterSingle('Werkrelatie', 2);
      checkRoleFilterSingle('Gebruiker', 1);
    });

    it('check filter by search', () => {
      // can't search for both firstname and lastname combined
      cy.get(settings.usersIndex.searchInput).type('Admin');
      cy.get(settings.usersIndex.searchButton).click();
      cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
      cy.get(utils.numberPagination.container).contains('van 1');
    });

    it('test the datatable', () => {
      // check if no result possible
      cy.contains(appuniversum.checkbox, 'Werkrelatie')
        .click();
      cy.contains(appuniversum.checkbox, 'Gebruiker')
        .click();

      cy.get(settings.usersIndex.table).contains('Geen resultaten gevonden');

      cy.contains(appuniversum.checkbox, 'Werkrelatie')
        .click();
      cy.contains(appuniversum.checkbox, 'Gebruiker')
        .click();

      // check sort by name
      cy.get(settings.usersIndex.row.name).eq(0)
        .contains('Admin Test');
      cy.intercept('GET', '/users?filter**').as('filterUsers1');
      cy.get(settings.usersIndex.tableContent.name).children('button')
        .click()
        .wait('@filterUsers1');
      cy.get(settings.usersIndex.row.name).eq(0)
        .contains('Vlaams Parlement Test');

      // check sort by last seen
      cy.intercept('GET', '/users?filter**').as('filterUsers2');
      cy.get(settings.usersIndex.tableContent.lastSeen).children('button')
        .click()
        .wait('@filterUsers2');
      cy.get(settings.usersIndex.row.name).eq(0)
        .should('not.contain', 'Admin Test');
      cy.intercept('GET', '/users?filter**').as('filterUsers3');
      cy.get(settings.usersIndex.tableContent.lastSeen).children('button')
        .click()
        .wait('@filterUsers3');
      cy.get(settings.usersIndex.row.name).eq(0)
        .contains('Admin Test');
    });

    // cypress can't find dropdown option, test not currently possible
    it.skip('should test blocking and unblocking', () => {
      // check unblocking user
      cy.get(settings.usersIndex.row.name).contains('User who is Blocked Test')
        .parents('tr')
        .as('currentRow');
      cy.get('@currentRow').find(settings.usersIndex.row.actionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(settings.usersIndex.row.action.unblockUser)
        .forceClick();
      cy.get(auk.confirmationModal.footer.confirm).click();
      cy.get(settings.usersIndex.row.name).contains('User who is Blocked Test')
        .find('au-c-pill--error')
        .should('not.exist');
      // check blocking
    });

    it('should test user detail', () => {
      cy.get(settings.usersIndex.row.name).contains('User who is Blocked Test')
        .parents('tr')
        .as('currentRow');

      cy.get('@currentRow').find(settings.goToUserDetail)
        .click();
      cy.get(settings.settingsHeader.title).contains('User who is Blocked Test');
      // check block/deblock
      cy.intercept('PATCH', 'users/**').as('patchUsers1');
      cy.get(settings.user.unblock).click();
      cy.get(settings.user.confirm.unblockUser).click()
        .wait('@patchUsers1');

      cy.intercept('PATCH', 'users/**').as('patchUsers2');
      cy.get(settings.user.block).click();
      cy.get(settings.user.confirm.blockUser).click()
        .wait('@patchUsers2');

      cy.intercept('PATCH', 'memberships/**').as('patchMemberships1');
      cy.get(settings.user.blockMembership).click();
      cy.get(settings.user.confirm.blockMembership).click()
        .wait('@patchMemberships1');

      cy.intercept('PATCH', 'memberships/**').as('patchMemberships2');
      cy.get(settings.user.unblockMembership).click();
      cy.get(settings.user.confirm.unblockMembership).click()
        .wait('@patchMemberships2');

      cy.get(auk.backButton).click();
      cy.url().should('include', 'instellingen/gebruikers?rollen');
    });

    // TODO totalcount is array(6)
    it.skip('should test the pagination by clicking previous and next', () => {
      cy.get(utils.numberPagination.size).click();
      cy.selectFromDropdown(5);
      cy.wait(1000);
      // This test should work regardless of the amount of publications, but may take longer and longer
      // We could make the "aantal=X" a value based on the found "totalcount" but then we have to account for odds and evens
      cy.get(auk.pagination.count).eq(0)
        .invoke('text')
        .then((text) => {
          const array = text.split(' ');
          const totalCount = array[2];
          cy.get(auk.pagination.previous).should('be.disabled');
          for (let index = 1; index < totalCount; index++) {
            cy.get(auk.pagination.count).should('contain', `${index}-${index}`);
            cy.get(auk.pagination.next).click();
            cy.get(settings.organizationsIndex.row).should('have.length', 1);
            cy.url().should('contain', `pagina=${index}`);
          }
          cy.get(auk.pagination.next).should('be.disabled');
          for (let index = totalCount - 1; index > 1; index--) {
            const currentCount = index + 1;
            cy.get(auk.pagination.count).should('contain', `${currentCount}-${currentCount}`);
            cy.url().should('contain', `pagina=${index}`);
            cy.get(auk.pagination.previous).click();
          }
          cy.get(auk.pagination.previous).click();
          cy.url().should('not.contain', 'pagina=');
          cy.get(auk.pagination.previous).should('be.disabled');
        });
    });
  });

  context('testing organizations index', () => {
    beforeEach(() => {
      cy.get(utils.mHeader.settings).click();
      cy.intercept('GET', '/roles/*').as('getRoles');
      cy.get(settings.settings.manageOrganizations).click();
      cy.get(auk.loader).should('not.exist');
      // cy.wait('@getRoles');
    });

    it('check filter by organization or organization ID', () => {
      // filter by organization name
      cy.get(settings.organizationFilter.filter).click();
      cy.get(settings.organizationFilter.search).type('Kaleidos Test Organisatie Alternatief');
      cy.get(dependency.emberPowerSelect.option).should('not.contain', 'Even geduld aub');
      cy.get(dependency.emberPowerSelect.option).contains('Kaleidos Test Organisatie Alternatief')
        .click();
      cy.get(settings.organizationsIndex.row.name).should('have.length', 1);

      // remove filter
      // cy.intercept('GET', '/user-organizations**').as('getUserOrgs');
      cy.get(settings.organizationFilter.clearFilter).click();
      cy.get(settings.organizationsIndex.row.name).should('have.length', 3);

      // filter by organization ID
      cy.get(settings.organizationFilter.filter).click();
      cy.intercept('GET', '/user-organizations?filter=OVO0**').as('filterOrg');
      cy.get(settings.organizationFilter.search).type('OVO0')
        .wait('@filterOrg');
      cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
      cy.get(dependency.emberPowerSelect.option).eq(0)
        .click();
      cy.get(settings.organizationsIndex.row.organizationId).should('have.length', 1)
        .contains('OVO0BOGUS');

      // site can throw errors which fail our test
      // // check link to OVO-code page
      // cy.get(settings.organizationFilter.ovoListLink).eq(0)
      //   .invoke('removeAttr', 'target') // dont open links in new windows by removing target (breaks cypress test).
      //   .click();
      // cy.url().should('include', 'wegwijs.vlaanderen.be/#/organisations');
      // cy.visit('/instellingen/organisaties');
    });

    it('check filter by blocked', () => {
      cy.get(settings.organizationsIndex.filterBlocked).click();
      cy.get(settings.organizationsIndex.row.organizationId).should('have.length', 1)
        .contains('OVO2BOGUS');
    });

    it('test the datatable', () => {
      // check deblocking
      cy.get(settings.organizationsIndex.row.name).contains('Kaleidos Test Organisatie Geblokkeerd')
        .contains('Geblokkeerd')
        .parents('tr')
        .as('currentRow');
      cy.get('@currentRow').find(settings.organizationsIndex.row.actionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get('@currentRow').find(settings.organizationsIndex.row.action.unblockOrganization)
        .forceClick();
      cy.get(auk.confirmationModal.footer.confirm).click();
      cy.get(settings.organizationsIndex.row.name).contains('Kaleidos Test Organisatie Geblokkeerd')
        .find('.au-c-pill--error')
        .should('not.exist');
      // check if no result possible
      cy.get(settings.organizationsIndex.filterBlocked).click();
      cy.get(settings.organizationsIndex.table).contains('Geen resultaten');

      // check login possible
      cy.logout();
      cy.intercept('POST', '/mock/sessions').as('mockLogin');
      cy.visit('mock-login');
      cy.get(route.mockLogin.list).within(() => {
        cy.contains('User with Blocked Organization Test').click()
          .wait('@mockLogin');
      });
      cy.logout();
      cy.login('Admin');
      cy.get(utils.mHeader.settings).click();
      cy.get(settings.settings.manageOrganizations).click();
      cy.get(auk.loader).should('not.exist');

      // check blocking
      // cy.get(settings.organizationsIndex.filterBlocked).click();
      cy.get('@currentRow').find(settings.organizationsIndex.row.actionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get('@currentRow').find(settings.organizationsIndex.row.action.blockOrganization)
        .forceClick();
      cy.get(auk.confirmationModal.footer.confirm).click();
      cy.get(settings.organizationsIndex.row.name).contains('Kaleidos Test Organisatie Geblokkeerd')
        .contains('Geblokkeerd');

      // TODO org is blocked but user isn't
      // // check login not possible
      // cy.logout();
      // cy.intercept('POST', '/mock/sessions').as('mockLogin');
      // cy.visit('mock-login');
      // cy.get(route.mockLogin.list).within(() => {
      //   cy.contains('User with Blocked Organization Test').click()
      //     .wait('@mockLogin');
      // });
      // cy.get(auk.alert.error).contains('U hebt geen toegang tot de applicatie');
      // cy.login('Admin');
      // cy.get(utils.mHeader.settings).click();
      // cy.get(settings.settings.manageOrganizations).click();
      // cy.get(auk.loader).should('not.exist');

      // check sort by organization
      cy.get(settings.organizationsIndex.row.name).eq(0)
        .contains('Kaleidos Test Organisatie');
      cy.get(settings.organizationsIndex.tableContent.organization).children('button')
        .click();
      cy.get(settings.organizationsIndex.row.name).eq(0)
        .contains('Kaleidos Test Organisatie');
      cy.get(settings.organizationsIndex.tableContent.organization).children('button')
        .click();
      cy.get(settings.organizationsIndex.row.name).eq(0)
        .contains('Kaleidos Test Organisatie Geblokkeerd');
      cy.get(settings.organizationsIndex.tableContent.organization).children('button')
        .click();

      // check sort by last seen
      cy.get(settings.organizationsIndex.row.name).eq(0)
        .contains('Kaleidos Test Organisatie Geblokkeerd');
      cy.get(settings.organizationsIndex.tableContent.organizationId).children('button')
        .click();
      cy.get(settings.organizationsIndex.row.name).eq(0)
        .contains('Kaleidos Test Organisatie');
      cy.get(settings.organizationsIndex.tableContent.organizationId).children('button')
        .click();
      cy.get(settings.organizationsIndex.row.name).eq(0)
        .contains('Kaleidos Test Organisatie Geblokkeerd');
      cy.get(settings.organizationsIndex.tableContent.organizationId).children('button')
        .click();
    });

    // TODO totalcount is array(6)
    it.skip('should test the pagination by clicking previous and next', () => {
      cy.get(utils.numberPagination.size).click();
      cy.selectFromDropdown(5);
      cy.wait(1000);
      // This test should work regardless of the amount of publications, but may take longer and longer
      // We could make the "aantal=X" a value based on the found "totalcount" but then we have to account for odds and evens
      cy.get(auk.pagination.count).invoke('text')
        .then((text) => {
          const array = text.split(' ');
          const totalCount = array[2];
          cy.get(auk.pagination.previous).should('be.disabled');
          for (let index = 1; index < totalCount; index++) {
            cy.get(auk.pagination.count).should('contain', `${index}-${index}`);
            cy.get(auk.pagination.next).click();
            cy.get(settings.organizationsIndex.row).should('have.length', 1);
            cy.url().should('contain', `pagina=${index}`);
          }
          cy.get(auk.pagination.next).should('be.disabled');
          for (let index = totalCount - 1; index > 1; index--) {
            const currentCount = index + 1;
            cy.get(auk.pagination.count).should('contain', `${currentCount}-${currentCount}`);
            cy.url().should('contain', `pagina=${index}`);
            cy.get(auk.pagination.previous).click();
          }
          cy.get(auk.pagination.previous).click();
          cy.url().should('not.contain', 'pagina=');
          cy.get(auk.pagination.previous).should('be.disabled');
        });
    });
  });
});
