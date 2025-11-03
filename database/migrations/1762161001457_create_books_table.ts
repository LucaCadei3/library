import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'books'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('isbn').unique().notNullable()
      table.integer('author_id').unsigned().references('id').inTable('authors').onDelete('CASCADE')
      table.integer('year').nullable()
      table.boolean('available').defaultTo(true)
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
