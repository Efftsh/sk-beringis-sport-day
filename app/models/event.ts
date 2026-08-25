import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import EventResult from './event_result.js'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: string // 'ev-01' ...

  @column()
  declare code: string

  @column()
  declare eventName: string

  @column()
  declare category: string

  @column()
  declare type: 'track' | 'field'

  @column()
  declare stage: string

  @column()
  declare status: 'pending' | 'completed'

  @column()
  declare scheduledTime: string

  @hasMany(() => EventResult, {
    foreignKey: 'eventId',
  })
  declare results: HasMany<typeof EventResult>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
