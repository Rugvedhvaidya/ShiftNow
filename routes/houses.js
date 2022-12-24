//This file is used to display all routes related to properties.
//routes to implement CRUD functionality.

const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateHouse, isOwner } = require('../middleware');

const houses = require('../controllers/houses');
const multer = require('multer');

const { storage } = require('../cloudinary')
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(houses.index))
    .post(isLoggedIn, upload.array('image'), validateHouse, catchAsync(houses.createHouse));



router.get('/new', isLoggedIn, houses.renderNewForm);
router.get('/filters', catchAsync(houses.filter))

router.route('/:id')
    .get(catchAsync(houses.showHouse))
    .put(isLoggedIn, isOwner, upload.array('image'), validateHouse, catchAsync(houses.updateHouse))
    .delete(isLoggedIn, isOwner, catchAsync(houses.deleteHouse));

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(houses.renderEditForm));



module.exports = router;