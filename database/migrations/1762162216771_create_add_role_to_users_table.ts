import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.enum('role', ['user', 'admin']).defaultTo('user')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('role')
    })
  }
}
