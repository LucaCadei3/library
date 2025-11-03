import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from './user.js'
import Book from './book.js'

export default class Loan extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare book_id: number

  @column.date()
  declare loan_date: DateTime

  @column.date()
  declare return_date: DateTime | null

  @column()
  declare returned: boolean

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Book)
  declare book: BelongsTo<typeof Book>
}
