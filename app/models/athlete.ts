import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import House from './house.js'

export default class Athlete extends BaseModel {
  @column({ isPrimary: true })
  declare id: string // 'ath-001' ...

  @column()
  declare name: string

  @column()
  declare className: string

  @column()
  declare gender: 'Lelaki' | 'Perempuan'

  @column()
  declare houseId: string

  @column()
  declare bib: string

  @column({
    prepare: (value: string[] | string) => (Array.isArray(value) ? JSON.stringify(value) : value),
    consume: (value: string | string[]) => {
      if (Array.isArray(value)) return value
      try {
        return JSON.parse(value)
      } catch {
        return []
      }
    },
  })
  declare eventsJson: string[]

  @belongsTo(() => House, {
    foreignKey: 'houseId',
  })
  declare house: BelongsTo<typeof House>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
