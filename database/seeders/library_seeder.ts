// database/seeders/LibrarySeeder.ts
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Author from '../../app/models/author.js'
import Book from '../../app/models/book.js'

export default class LibrarySeeder extends BaseSeeder {
  public async run() {
    // 1️⃣ Autori: upsert by name (idempotente)
    const authorSeeds = [
      { id: 1, name: 'Jane Austen' },
      { id: 2, name: 'George Orwell' },
      { id: 3, name: 'F. Scott Fitzgerald' },
      { id: 4, name: 'Herman Melville' },
      { id: 5, name: 'Harper Lee' },
      { id: 6, name: 'Charlotte Brontë' },
      { id: 7, name: 'Aldous Huxley' },
      { id: 8, name: 'Emily Brontë' },
      { id: 9, name: 'J.R.R. Tolkien' },
      { id: 10, name: 'Gabriel García Márquez' },
      { id: 11, name: 'Leo Tolstoy' },
      { id: 12, name: 'Fyodor Dostoevsky' },
      { id: 13, name: 'J.D. Salinger' },
      { id: 14, name: 'Homer' },
      { id: 15, name: 'Charles Dickens' },
      { id: 16, name: 'Miguel de Cervantes' },
      { id: 17, name: 'Dante Alighieri' },
      { id: 18, name: 'Victor Hugo' },
      { id: 19, name: 'Mary Shelley' },
      { id: 20, name: 'Ernest Hemingway' },
    ]

    const authorIdMap = new Map<number, number>()
    for (const seed of authorSeeds) {
      const author = await Author.updateOrCreate({ name: seed.name }, { name: seed.name })
      authorIdMap.set(seed.id, author.id)
    }

    // 2️⃣ Libri: upsert by ISBN (idempotente). Gli ID autore vengono mappati.
    const bookSeeds = [
      { title: 'Pride and Prejudice', isbn: '9780141439518', author_id: 1, year: 1813, available: true },
      { title: 'Sense and Sensibility', isbn: '9780141439662', author_id: 1, year: 1811, available: true },
      { title: '1984', isbn: '9780451524935', author_id: 2, year: 1949, available: true },
      { title: 'Animal Farm', isbn: '9780451526342', author_id: 2, year: 1945, available: true },
      { title: 'The Great Gatsby', isbn: '9780743273565', author_id: 3, year: 1925, available: true },
      { title: 'Tender Is the Night', isbn: '9780684801544', author_id: 3, year: 1934, available: true },
      { title: 'Moby-Dick', isbn: '9780142437247', author_id: 4, year: 1851, available: true },
      { title: 'Bartleby, the Scrivener', isbn: '9780142437261', author_id: 4, year: 1853, available: true },
      { title: 'To Kill a Mockingbird', isbn: '9780060935467', author_id: 5, year: 1960, available: true },
      { title: 'Go Set a Watchman', isbn: '9780062409850', author_id: 5, year: 2015, available: true },
      { title: 'Jane Eyre', isbn: '9780141441146', author_id: 6, year: 1847, available: true },
      { title: 'Shirley', isbn: '9780140436120', author_id: 6, year: 1849, available: true },
      { title: 'Brave New World', isbn: '9780060850524', author_id: 7, year: 1932, available: true },
      { title: 'Island', isbn: '9780060928648', author_id: 7, year: 1962, available: true },
      { title: 'Wuthering Heights', isbn: '9780141439556', author_id: 8, year: 1847, available: true },
      { title: 'Poems by Emily Brontë', isbn: '9780140423773', author_id: 8, year: 1846, available: true },
      { title: 'The Hobbit', isbn: '9780261103344', author_id: 9, year: 1937, available: true },
      { title: 'The Lord of the Rings', isbn: '9780261103252', author_id: 9, year: 1954, available: true },
      { title: 'One Hundred Years of Solitude', isbn: '9780060883287', author_id: 10, year: 1967, available: true },
      { title: 'Love in the Time of Cholera', isbn: '9780307389732', author_id: 10, year: 1985, available: true },
      { title: 'War and Peace', isbn: '9780199232765', author_id: 11, year: 1869, available: true },
      { title: 'Anna Karenina', isbn: '9780143035008', author_id: 11, year: 1878, available: true },
      { title: 'Crime and Punishment', isbn: '9780140449136', author_id: 12, year: 1866, available: true },
      { title: 'The Brothers Karamazov', isbn: '9780374528379', author_id: 12, year: 1880, available: true },
      { title: 'The Catcher in the Rye', isbn: '9780316769488', author_id: 13, year: 1951, available: true },
      { title: 'Franny and Zooey', isbn: '9780316769495', author_id: 13, year: 1961, available: true },
      { title: 'The Odyssey', isbn: '9780140268867', author_id: 14, year: -800, available: true },
      { title: 'The Iliad', isbn: '9780140275360', author_id: 14, year: -750, available: true },
      { title: 'Great Expectations', isbn: '9780141439563', author_id: 15, year: 1861, available: true },
      { title: 'Oliver Twist', isbn: '9780141439747', author_id: 15, year: 1839, available: true },
      { title: 'Don Quixote', isbn: '9780060934347', author_id: 16, year: 1605, available: true },
      { title: 'Novelas ejemplares', isbn: '9780142437179', author_id: 16, year: 1613, available: true },
      { title: 'Divine Comedy', isbn: '9780140448955', author_id: 17, year: 1320, available: true },
      { title: 'Inferno', isbn: '9780140448955', author_id: 17, year: 1320, available: true },
      { title: 'Les Misérables', isbn: '9780451419439', author_id: 18, year: 1862, available: true },
      { title: 'The Hunchback of Notre-Dame', isbn: '9780140449105', author_id: 18, year: 1831, available: true },
      { title: 'Frankenstein', isbn: '9780141439471', author_id: 19, year: 1818, available: true },
      { title: 'The Last Man', isbn: '9780140437998', author_id: 19, year: 1826, available: true },
      { title: 'The Old Man and the Sea', isbn: '9780684801223', author_id: 20, year: 1952, available: true },
      { title: 'A Farewell to Arms', isbn: '9780684801469', author_id: 20, year: 1929, available: true },
      { title: 'For Whom the Bell Tolls', isbn: '9780684803357', author_id: 20, year: 1940, available: true },
      { title: 'The Sun Also Rises', isbn: '9780743297332', author_id: 20, year: 1926, available: true },
      { title: 'To Have and Have Not', isbn: '9780684801206', author_id: 20, year: 1937, available: true },
      { title: 'Islands in the Stream', isbn: '9780684803807', author_id: 20, year: 1970, available: true },
      { title: 'Green Hills of Africa', isbn: '9780684802371', author_id: 20, year: 1935, available: true },
      { title: 'Death in the Afternoon', isbn: '9780684802265', author_id: 20, year: 1932, available: true },
      { title: 'The Torrents of Spring', isbn: '9780684803173', author_id: 20, year: 1926, available: true },
      { title: 'Men Without Women', isbn: '9780684803050', author_id: 20, year: 1927, available: true },
      { title: 'A Moveable Feast', isbn: '9780684803050', author_id: 20, year: 1964, available: true },
      { title: 'Across the River and Into the Trees', isbn: '9780684802954', author_id: 20, year: 1950, available: true },
      { title: 'Islands in the Stream', isbn: '9780684803807', author_id: 20, year: 1970, available: true },
    ]

    for (const book of bookSeeds) {
      const mappedAuthorId = authorIdMap.get(book.author_id)
      if (!mappedAuthorId) continue
      await Book.updateOrCreate(
        { isbn: book.isbn },
        {
          title: book.title,
          isbn: book.isbn,
          authorId: mappedAuthorId,
          year: book.year,
          available: book.available,
        }
      )
    }
  }
}