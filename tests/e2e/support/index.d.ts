/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    setOnline(val: boolean): void
    waitGraphQL(): void

    vInput_Type(label: string, value: string): Chainable<any>

    // @ts-ignore
    vBtn_Click(label: string, selector: string = ''): Chainable<any>

    // @ts-ignore
    vBtnIcon_Click(label: string, rightIcon: boolean = false, selector: string = ''): Chainable<any>

    // @ts-ignore
    vListTile_Click(label: string, icon: boolean = false): Chainable<any>

    gql_addItem(amount: number, checkedAt?: string, disposalAt?: string, depreciationAt?: string): Chainable<any>

    gql_removeItem(): Chainable<any>

    gql_removeChild(): Chainable<any>

    gql_editItem(): Chainable<any>

    // @ts-ignore
    gql_editChild(opened: boolean = false): Chainable<any>

    gql_restoreItem__noItem(): Chainable<any>

    gql_restoreItem(): Chainable<any>

    item_checkChildren(amount: number): Chainable<any>

    itemCardLength(): Chainable<number>

    refetchItems(): void
  }
}
