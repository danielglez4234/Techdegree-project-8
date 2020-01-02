'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Book extends Sequelize.Model {}
  Book.init({
    title: {
      type: Sequelize.STRING,
      allowNull: false, // disallow null
      validate: {
        notEmpty: {
          msg: '"Title" is required'
        }
      }
    },
    author: {
      type: Sequelize.STRING,
      allowNull: false, // disallow null
      validate: {
        notEmpty: {
          msg: '"Author" is required'
        }
      }
    },
    genre : {
      type: Sequelize.STRING,
      allowNull: false // disallow null
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false, // disallow null
      defaultValue: false, // set default value
      validate: {
        min: {
          args: 1700,
          msg: 'Year it has to be between 1700 and the current year',
        },
        max: {
          args: (new Date).getFullYear(),
          msg: 'Year it has to be between 1700 and the current year',
        },
      },
    }

  }, { sequelize });

  return Book;
};
