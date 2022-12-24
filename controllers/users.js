// This file consists of callback functions which are used by the user routes

const User = require('../models/user');
const House = require('../models/house');
const Wishlist = require('../models/wishlist');

//This function is used to render a signup form of the application.
module.exports.renderRegister = (req, res) => {
    res.render('users/signUp');
}

//This function collects data from sign up form and pushes it to the database.

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password, phone } = req.body;
        const user = new User({ email, username, phone });
        const registeredUser = await User.register(user, password);
        const wishlist = await new Wishlist;
        wishlist.user = registeredUser._id;
        await wishlist.save();
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to ShiftNow');
            res.redirect('/houses');
        })
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('signUp')
    }
}

//This function is used to display a login form of the application.

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

//This function checks the existence of the user.
//if user exists, he/she can login into the application.

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back');
    const redirectUrl = req.session.returnTo || '/houses';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

//This function is used to logout the user from application.

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged you out');
    res.redirect('/houses');
}

//This function is used to display the owner profile to tenant.

module.exports.profile = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    const houses = await House.find({ "owner": `${id}` });
    res.render('users/show', { user, houses })
}