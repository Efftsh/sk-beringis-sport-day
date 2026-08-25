import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from './event.js'
import House from './house.js'

export default class EventResult extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare eventId: string

  @column()
  declare houseId: string

  @column()
  declare athleteName: string

  @column()
  declare bib: string | null

  @column()
  declare place: number // 1, 2, 3, 4

  @column()
  declare medal: 'gold' | 'silver' | 'bronze' | 'fourth'

  @column()
  declare points: number

  @column()
  declare lane: number | null

  @column()
  declare recordValue: string | null

  @column()
  declare isRecordBroken: boolean

  @belongsTo(() => Event, {
    foreignKey: 'eventId',
  })
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => House, {
    foreignKey: 'houseId',
  })
  declare house: BelongsTo<typeof House>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
