//This file defines the schema of the house.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});


const opts = { toJSON: { virtuals: true } }

const HouseSchema = new Schema({
    roomType: String,
    images: [ImageSchema],
    location: String,
    price: Number,
    description: String,
    availability: String,
    parking: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);


HouseSchema.index({ location: 'text' });


HouseSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/houses/${this._id}">${this.roomType}</a><strong>
    <p>Available ${this.availability.substring(0, 20)}...</p >
`
});

// This route is used to delete reviews of the property, when the property is deleted.
HouseSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('House', HouseSchema);