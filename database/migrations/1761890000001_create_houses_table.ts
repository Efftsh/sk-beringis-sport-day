import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'houses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 50).primary() // 'merah', 'biru', 'kuning', 'hijau'
      table.string('name', 100).notNullable()
      table.string('color', 20).notNullable()
      table.string('light_bg', 50).notNullable()
      table.string('badge_bg', 100).notNullable()
      table.string('motto', 255).notNullable()
      table.integer('rank').defaultTo(1)
      table.integer('points').defaultTo(0)
      table.integer('gold_medals').defaultTo(0)
      table.integer('silver_medals').defaultTo(0)
      table.integer('bronze_medals').defaultTo(0)
      table.integer('fourth_places').defaultTo(0)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
