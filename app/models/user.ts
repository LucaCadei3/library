import { BaseModel, column, beforeSave, beforeFetch } from '@adonisjs/lucid/orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare fullName: string

  @column()
  declare role: 'admin' | 'user'
}
