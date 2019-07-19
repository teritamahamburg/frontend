import { dbReset, gqlSupport } from '../support/gqlSupport';
import generalSpec from '../generalSpec';
import locale from '../../../src/locales/jp';

gqlSupport(false);

describe('Offline Test', () => {
  before(() => {
    dbReset();
    cy.clearLocalStorage();
  });

  it('visit', () => {
    cy.visit('/');
    cy.waitGraphQL();
  });

  it('checkOffline', () => {
    cy.setOnline(false);
    cy.contains(locale.general.offlineMode).should('be.visible');
  });

  generalSpec(false);
});
