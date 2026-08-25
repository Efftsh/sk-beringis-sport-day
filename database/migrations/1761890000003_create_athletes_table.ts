import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'athletes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 50).primary() // 'ath-001' ...
      table.string('name', 200).notNullable()
      table.string('class_name', 100).notNullable()
      table.string('gender', 20).notNullable() // 'Lelaki' or 'Perempuan'
      table.string('house_id', 50).references('id').inTable('houses').onDelete('CASCADE').notNullable()
      table.string('bib', 50).notNullable()
      table.jsonb('events_json').defaultTo('[]')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
