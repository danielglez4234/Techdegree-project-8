const express = require('express');
const router = express.Router();

/* GET home page, redirect 1. */
router.get('/', (req, res, next) => {
  res.redirect("/books/page/1");
});

/* GET home page, redirect 2. */
router.get('/books', (req, res) => {
   res.redirect("/books/page/1");
});

module.exports = router;
