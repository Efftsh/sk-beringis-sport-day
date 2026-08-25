import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_results'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('event_id', 50).references('id').inTable('events').onDelete('CASCADE').notNullable()
      table.string('house_id', 50).references('id').inTable('houses').onDelete('CASCADE').notNullable()
      table.string('athlete_name', 200).notNullable()
      table.string('bib', 50).nullable()
      table.integer('place').notNullable() // 1, 2, 3, 4
      table.string('medal', 20).notNullable() // 'gold', 'silver', 'bronze', 'fourth'
      table.integer('points').notNullable()
      table.integer('lane').nullable()
      table.string('record_value', 50).nullable()
      table.boolean('is_record_broken').defaultTo(false)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
