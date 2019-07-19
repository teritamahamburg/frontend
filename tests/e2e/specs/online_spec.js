import { gqlSupport } from '../support/gqlSupport';
import generalSpec from '../generalSpec';

gqlSupport();

describe('Online Test', () => {
  it('visit', () => {
    cy.visit('/');
    cy.setOnline(true);
    cy.waitGraphQL();
  });

  generalSpec();
});
