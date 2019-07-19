import { gqlSupport, dbReset } from '../support/gqlSupport';
import locale from '../../../src/locales/ja';
import generalSpec from '../generalSpec';

gqlSupport(false);

describe('Online to Offline Test', () => {
  before(() => {
    dbReset();
  });

  it('visit', () => {
    cy.visit('/');
    cy.waitGraphQL();
  });

  it('addItem(ONLINE)', () => {
    cy.gql_addItem(3);
  });

  it('checkOffline', () => {
    cy.setOnline(false);
    cy.contains(locale.general.offlineMode).should('be.visible');
  });

  generalSpec(false);
});
