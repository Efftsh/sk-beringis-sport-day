import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Athlete from './athlete.js'
import EventResult from './event_result.js'

export default class House extends BaseModel {
  @column({ isPrimary: true })
  declare id: string // 'merah', 'biru', 'kuning', 'hijau'

  @column()
  declare name: string

  @column()
  declare color: string

  @column()
  declare lightBg: string

  @column()
  declare badgeBg: string

  @column()
  declare motto: string

  @column()
  declare rank: number

  @column()
  declare points: number

  @column()
  declare goldMedals: number

  @column()
  declare silverMedals: number

  @column()
  declare bronzeMedals: number

  @column()
  declare fourthPlaces: number

  @hasMany(() => Athlete, {
    foreignKey: 'houseId',
  })
  declare athletes: HasMany<typeof Athlete>

  @hasMany(() => EventResult, {
    foreignKey: 'houseId',
  })
  declare results: HasMany<typeof EventResult>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
