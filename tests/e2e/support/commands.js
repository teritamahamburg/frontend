import locale from '../../../src/locales/ja';

let ONLINE = true;
Cypress.Commands.add('setOnline', (val) => {
  cy.window().its('store')
  // eslint-disable-next-line no-return-assign,no-param-reassign
    .then(store => store.state.online = val);
  ONLINE = val;
});


Cypress.Commands.add('waitGraphQL', () => {
  if (ONLINE) {
    cy.wait('@graphql');
  } else {
    cy.wait(400);
  }
});

Cypress.Commands.add('vInput_Type', { prevSubject: 'element' }, (subject, label, value) => {
  cy.wrap(subject, { log: false })
    .get(`input[aria-label="${label}"]`, { log: false })
    .type(`${value}{enter}{esc}`);
});

Cypress.Commands.add('vBtn_Click', (label, selector = '') => {
  cy.contains(`${selector} .v-btn .v-btn__content`, new RegExp(`^\\s*${label}\\s*$`))
    .parent({ log: false })
    .focus({ log: false })
    .click();
});

Cypress.Commands.add('vBtnIcon_Click', (label, rightIcon = false, selector = '') => {
  cy.contains(`${selector} .v-btn .v-btn__content`, new RegExp(`^${!rightIcon ? '(.*)\\n' : ''}\\s*${label}\\s*${rightIcon ? '\\n(.*)' : ''}$`))
    .parent({ log: false })
    .focus({ log: false })
    .click();
});

Cypress.Commands.add('vListTile_Click', (label, icon = false) => {
  cy.contains('.menuable__content__active .v-list__tile', new RegExp(`${icon ? '' : '^'}\\s*${label}\\s*$`))
    .click();
});

Cypress.Commands.add('gql_addItem', (amount, checkedAt, disposalAt, depreciationAt) => {
  cy.itemCardLength().then((length) => {
    cy.get('.create-button--add').click();
    cy.waitGraphQL(); // query users
    const d = cy.get('.item-add--dialog')
      .vInput_Type(`${locale.item.name}*`, 'NAME')
      .vInput_Type(`${locale.item.code}*`, `CODE_${Date.now()}`)
      .vInput_Type(`${locale.item.amount}*`, `{backspace}${amount}`)
      .vInput_Type(`${locale.item.admin}*`, 'ADMIN')
      .vInput_Type(`${locale.item.course}*`, 'COURSE')
      .vInput_Type(`${locale.item.room}*`, '999')
      .vInput_Type(`${locale.item.purchasedAt}*`, new Date().toISOString().substr(0, 10));
    if (checkedAt) d.vInput_Type(locale.item.checkedAt, checkedAt);
    if (disposalAt) d.vInput_Type(locale.item.disposalAt, disposalAt);
    if (depreciationAt) d.vInput_Type(locale.item.depreciationAt, depreciationAt);
    cy.vBtn_Click(locale.general.add);
    cy.waitGraphQL(); // mutate addItem
    cy.waitGraphQL(); // query items
    cy.itemCardLength().should('eq', ONLINE ? 1 : length + 1);
  });
});

Cypress.Commands.add('gql_removeItem', () => {
  cy.itemCardLength().then((length) => {
    cy.vBtn_Click('more_vert');
    cy.vListTile_Click(locale.general.edit);
    cy.vBtn_Click(locale.general.remove);
    cy.contains(locale.general.removeText.items.replace('{n}', 1))
      .its('length').should('eq', 1);
    cy.vBtn_Click(locale.general.remove, '.remove--dialog');
    cy.waitGraphQL(); // mutate
    cy.waitGraphQL(); // query
    cy.itemCardLength().should('eq', ONLINE ? 0 : length - 1);
  });
});

Cypress.Commands.add('gql_removeChild', () => {
  cy.vBtnIcon_Click(locale.general.children, true, '.item-card:last-child');
  cy.vBtn_Click('more_vert', '.child-card');
  cy.vListTile_Click(locale.general.edit);
  cy.vBtn_Click(locale.general.remove);
  cy.contains(locale.general.removeText.children.replace('{n}', 1))
    .its('length').should('eq', 1);
  cy.vBtn_Click(locale.general.remove, '.remove--dialog');
  cy.waitGraphQL(); // mutate remove
  cy.waitGraphQL(); // query items
  cy.wait(500);
  cy.get('.child-cards .child-card')
    .its('length').should('eq', 1);
  cy.vBtnIcon_Click(locale.general.close, false, '.item-card:last-child');
});

Cypress.Commands.add('gql_editItem', () => {
  cy.contains(new RegExp(`${locale.item.room}\\s+999`))
    .its('length').should('eq', 1);
  cy.vBtn_Click('more_vert');
  cy.vListTile_Click(locale.general.edit);
  cy.get('.item-edit--dialog')
    .vInput_Type(locale.item.room, 9999);
  cy.vBtn_Click(locale.general.edit);
  cy.waitGraphQL(); // mutate edit
  cy.waitGraphQL(); // query items
  cy.contains(new RegExp(`${locale.item.room}\\s+9999`))
    .its('length').should('eq', 1);
});

Cypress.Commands.add('gql_editChild', (opened = false) => {
  if (!opened) cy.vBtnIcon_Click(locale.general.children, true);
  cy.vBtn_Click('more_vert', '.child-card');
  cy.vListTile_Click(locale.general.edit);
  cy.get('.item-edit--dialog')
    .vInput_Type(locale.item.name, 'EDITED_NAME');
  cy.vBtn_Click(locale.general.edit);
  cy.waitGraphQL(); // mutate edit
  cy.waitGraphQL(); // query items
  cy.contains('.child-card', 'EDITED_NAME')
    .its('length').should('eq', 1);
  if (!opened) cy.vBtnIcon_Click(locale.general.close, false, '.item-card');
});

Cypress.Commands.add('gql_restoreItem__noItem', () => {
  cy.vBtn_Click('menu');
  cy.vListTile_Click(locale.general.restoreItem, true);
  cy.waitGraphQL(); // query item
  cy.waitGraphQL(); // query child
  cy.contains(new RegExp(`^${locale.general.empty}$`)).should('exist');
  cy.vBtn_Click(locale.general.cancel, '.item-restore--dialog');
});

Cypress.Commands.add('gql_restoreItem', () => {
  cy.vBtn_Click('menu');
  cy.vListTile_Click(locale.general.restoreItem, true);
  cy.waitGraphQL(); // query item
  cy.waitGraphQL(); // query child
  cy.get('.item-restore--dialog .v-datatable tbody tr:nth-child(1)').click();
  cy.waitGraphQL(); // mutate
  cy.waitGraphQL(); // query
  cy.gql_restoreItem__noItem();
});

Cypress.Commands.add('item_checkChildren', (amount) => {
  cy.vBtnIcon_Click(locale.general.children, true, '.item-card:last-child');
  cy.get('.child-cards .child-card')
    .its('length')
    .should('eq', amount);
  cy.vBtnIcon_Click(locale.general.close, false, '.item-card');
});

Cypress.Commands.add('itemCardLength', () => {
  cy.wait(100);
  return cy.get('.home .items-view').children()
    .then((child) => {
      if (child.hasClass('empty')) {
        return Promise.resolve(0);
      }
      return cy.get('.items-view .item-card').its('length');
    });
});
