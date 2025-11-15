import factory from '@adonisjs/lucid/factories'
import Book from '#models/book'
import { AuthorFactory } from './author_factory.js'

export const BookFactory = factory
  .define(Book, async ({ faker }) => {
    return {
      title: faker.lorem.words(3),
      isbn: faker.string.numeric(13),
      year: faker.date.past({ years: 50 }).getFullYear(),
      available: faker.datatype.boolean(),
    }
  })
  .relation('author', () => AuthorFactory)
  .build()