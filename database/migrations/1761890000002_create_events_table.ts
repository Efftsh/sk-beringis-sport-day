import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 50).primary() // 'ev-01' ... 'ev-40'
      table.string('code', 50).notNullable() // 'A01' ...
      table.string('event_name', 150).notNullable() // '100 meter'
      table.string('category', 150).notNullable() // 'Tahun 4 Lelaki'
      table.string('type', 50).notNullable().defaultTo('track') // 'track' or 'field'
      table.string('stage', 50).notNullable().defaultTo('Akhir')
      table.string('status', 50).notNullable().defaultTo('pending') // 'pending' or 'completed'
      table.string('scheduled_time', 100).notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
