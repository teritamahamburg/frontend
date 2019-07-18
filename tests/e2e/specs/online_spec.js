import locale from '../../../src/locales/jp';

describe('Online Test', () => {
  it('visit', () => {
    cy.visit('/');
    cy.wait('@graphql');
  });

  it('addItem(amount:1)', () => {
    cy.gql_addItem(1);
  });

  it('addItem(amount:3)', () => {
    cy.gql_addItem(3);

    cy.item_checkChildren(3);
  });

  it('addItem(amount:2,in optionals)', () => {
    const today = new Date().toISOString().substr(0, 10);
    cy.gql_addItem(2, today, today, today);

    cy.item_checkChildren(2);
  });

  it('editItem', () => {
    cy.gql_addItem(1);
    cy.gql_editItem();
  });

  it('editChild', () => {
    cy.gql_addItem(2);
    cy.gql_editChild();
  });

  it('removeItem', () => {
    cy.gql_addItem(1);
    cy.gql_removeItem();
  });

  it('removeChild', () => {
    cy.gql_addItem(2);
    cy.gql_removeChild();
  });

  it('itemHistories', () => {
    cy.gql_addItem(1);
    cy.vBtn_Click('more_vert');
    cy.vListTile_Click(locale.general.editHistory);
    cy.wait('@graphql'); // query itemHistories
    cy.contains('No data available').should('exist');
    cy.vBtn_Click(locale.general.close);
    cy.gql_editItem();
    cy.vBtn_Click('more_vert');
    cy.vListTile_Click(locale.general.editHistory);
    cy.wait('@graphql'); // query itemHistories
    cy.contains('999').should('exist');
    cy.vBtn_Click(locale.general.close);
  });

  it('childHistories', () => {
    cy.gql_addItem(2);
    cy.vBtnIcon_Click(locale.general.children);
    cy.vBtn_Click('more_vert', '.child-card');
    cy.vListTile_Click(locale.general.editHistory);
    cy.wait('@graphql'); // query childHistories
    cy.contains('No data available').should('exist');
    cy.vBtn_Click(locale.general.close);
    cy.gql_editChild(true);
    cy.wait(500);
    cy.vBtn_Click('more_vert', '.child-card');
    cy.vListTile_Click(locale.general.editHistory);
    cy.wait('@graphql'); // query childHistories
    cy.get('.v-datatable tbody tr').children()
      .its('length').should('not.eq', 1);
    cy.vBtn_Click(locale.general.close);
    cy.vBtnIcon_Click(locale.general.close, false, '.item-card');
  });

  it('restoreItem', () => {
    cy.gql_restoreItem__noItem();
    cy.gql_addItem(1);
    cy.gql_removeItem();
    cy.get('.items-view .item-card').should('not.exist');
    cy.gql_restoreItem();
    cy.get('.items-view .item-card').should('exist');
  });

  it('restoreChild', () => {
    cy.gql_restoreItem__noItem();
    cy.gql_addItem(2);
    cy.item_checkChildren(2);
    cy.gql_removeChild();
    cy.gql_restoreItem();
    cy.item_checkChildren(2);
  });

  /*
    Scan
     - fetch item,child
     - mutate item,child
    Search
     - search item, child

    Offline -> Onlineになった時
     - apollo cache = 0
    Online -> Offlineになった時
     - apollo cache = ^1
   */
});
