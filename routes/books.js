const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Sequelize = require('sequelize');
const  Op  = Sequelize.Op;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}

/*----------------------------Index Page, Pagination-----------------------------------------*/
/* GET books listing and pagination. */
router.get('/page/:page', asyncHandler(async (req, res) => {
  let actulaPage = parseInt(req.params.page);

  // calculating the first and last book to show when moving between pages
  let perPage = 6;
  let offset = ( perPage * actulaPage ) - perPage;
  const book = await Book.findAll({ order: [[ "createdAt", "DESC"  ]], offset: offset, limit: perPage});

  // taking out the number of books in the database and calculating the number of pages to display
  const countBooks = await Book.count();
  const totalPages =  Math.ceil( countBooks / perPage );

  // with this we can move between the pages by clicking on the arrows
  let nextPage = actulaPage + 1;
  let prevPage = actulaPage - 1;

  if (book.length > 0) {
    res.render("index", { books: book, totalPages, active: actulaPage, nextPage, prevPage});
  }else {
    res.render('page-not-found');
  }
}));


/*----------------------------Index Page, Search a book ------------------------------------------*/
/* GET perform book search. */
router.get('/search', asyncHandler(async(req, res) => {
  let searchText  = req.query.q; // obtaining the text sent by the search input

  // using the operators we make a select that compares between the four fields,
  // using the LIKE operator we allow partial matches.
  const books = await Book.findAll({
    where: { [Op.or]: {
        title: {
          [Op.like]:'%'+ searchText +'%'
        },
        author: {
          [Op.like]:'%'+ searchText +'%'
        },
        genre: {
          [Op.like]:'%'+ searchText +'%'
        },
        year: {
          [Op.like]:'%'+ searchText +'%'
        }
    } }
  });
  let totalResults = books.length; // we save the amount of results to show them later on the page
  if(books) {
    res.render("index", { books, notFoundText: searchText, totalResults, title: "Search a Book" });
  } else {
    res.render("page-not-found");
  }
}));


/*----------------------------New-book Page, Create book --------------------------------------*/
/* GET create a new book form. */
router.get('/new', (req, res) => {
  res.render("new-book", { book: {}, title: "New Book" });
});

/* POST create book. */
router.post('/new', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books/page/1");
  } catch (error) {
    if(error.name === "SequelizeValidationError") { // checking the error
      book = await Book.build(req.body);
      console.log(error);
      res.render("new-book", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error; // error caught in the asyncHandler's catch block
    }
  }
}));


/*----------------------------Update-book Page, Update book -----------------------------------------*/
/* GET update book form. */
router.get('/:id', asyncHandler(async(req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("update-book", { book, title: "Edit Book" });
  } else {
    res.render("error");
  }
}));

/* POST update a book. */
router.post('/:id', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if(book) {
      await book.update(req.body);
      res.redirect("/books/page/1");
    } else {
      res.render("error");
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct book gets updated
      res.render("update-book", { book, errors: error.errors, title: "Edit Book" })
    } else {
      throw error;
    }
  }
}));


/*----------------------------Update Page, Delete book -----------------------------------------*/
/* POST delete individual book. */
router.post('/:id/delete', asyncHandler(async (req ,res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/books/page/1");
  } else {
    res.render("error");
  }
}));


module.exports = router;
