//This file defines the schema of the Wishlist.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const House = require('./house');
const User = require('./user');

//Wishlists are linked to users using userID.
const WishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    home: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Houses'
        }
    ]
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
