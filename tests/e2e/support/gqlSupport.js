let polyfill;

beforeEach(() => {
  const polyfillUrl = 'https://unpkg.com/whatwg-fetch@3.0.0/dist/fetch.umd.js';
  cy.request(polyfillUrl).then((response) => {
    polyfill = response.body;
  });

  cy.server();
  cy.route('POST', '/graphql').as('graphql');

  cy.request('DELETE', 'http://localhost:8081/db_reset');
});

Cypress.on('window:before:load', (win) => {
  // eslint-disable-next-line no-param-reassign
  delete win.fetch;
  win.eval(polyfill);
});
