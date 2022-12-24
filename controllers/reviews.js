// This file consists of callback functions which are used by the review routes
const House = require('../models/house');
const Review = require('../models/review');

//This function is used to add review to the house.

module.exports.createReview = async (req, res) => {
    const house = await House.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    house.reviews.push(review);
    await review.save();
    await house.save();
    req.flash('success', 'Posted a new review');
    res.redirect(`/houses/${house._id}`);
}

//This function is used to delete review of the house.

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await House.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted the review');
    res.redirect(`/houses/${id}`);
}