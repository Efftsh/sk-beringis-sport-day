import { BaseSchema } from '@adonisjs/lucid/schema'
import db from '@adonisjs/lucid/services/db'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.defer(async () => {
      await db
        .from(this.tableName)
        .whereIn('code', ['A05', 'A07', 'A08'])
        .update({
          scheduled_time: '07:30 AM (Hari 2)',
        })
    })
  }

  async down() {
    this.defer(async () => {
      await db
        .from(this.tableName)
        .whereIn('code', ['A05', 'A07', 'A08'])
        .update({
          scheduled_time: '07:30 AM (Hari 1)',
        })
    })
  }
}
