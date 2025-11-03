import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Author from './author.js'
import Loan from './loan.js'

export default class Book extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare isbn: string

  @column()
  declare author_id: number

  @column()
  declare year: number

  @column()
  declare available: boolean

  @belongsTo(() => Author)
  declare author: BelongsTo<typeof Author>

  @hasMany(() => Loan)
  declare loans: HasMany<typeof Loan>
}
