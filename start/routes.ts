import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return { hello: 'world' }
})

// Rotte pubbliche
router.post('register', '#controllers/auth_controller.register')
router.post('login', '#controllers/auth_controller.login')

// Libri e autori - ricerca pubblica
router.get('books', '#controllers/books_controller.index')
router.get('books/:id', '#controllers/books_controller.show')
router.get('authors', '#controllers/authors_controller.index')
router.get('authors/:id', '#controllers/authors_controller.show')

// Rotte protette (autenticazione richiesta)
router.group(() => {
  // Books - solo admin può creare/modificare/eliminare
  router.post('books', '#controllers/books_controller.store').use(middleware.admin())
  router.put('books/:id', '#controllers/books_controller.update').use(middleware.admin())
  router.delete('books/:id', '#controllers/books_controller.destroy').use(middleware.admin())

  // Authors - solo admin può creare/modificare/eliminare
  router.post('authors', '#controllers/authors_controller.store').use(middleware.admin())
  router.put('authors/:id', '#controllers/authors_controller.update').use(middleware.admin())
  router.delete('authors/:id', '#controllers/authors_controller.destroy').use(middleware.admin())

  // Loans - tutti gli utenti autenticati
  router.get('loans', '#controllers/loans_controller.index')
  router.get('loans/:id', '#controllers/loans_controller.show')
  router.post('loans', '#controllers/loans_controller.store')
  router.put('loans/:id', '#controllers/loans_controller.update')
  router.delete('loans/:id', '#controllers/loans_controller.destroy')
}).use(middleware.auth())