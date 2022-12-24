// This file is used to connect the server and the database.
// Addresses the scripts/links from external websites for security of the web application.
// 
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const House = require('./models/house');
const User = require('./models/user');
const Wishlist = require('./models/wishlist');
const mongoSanitize = require('express-mongo-sanitize');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


const houseRoutes = require('./routes/houses');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const { isLoggedIn, isOwner, isOwnerNeg } = require('./middleware');
const catchAsync = require('./utils/catchAsync');
const user = require('./models/user');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');



const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/shiftnow';


mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Database connected!!!!");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}))


const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("Session Store Error", e)
})


const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.0/font/bootstrap-icons.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://fonts.gstatic.com/s/heebo/v10/NGSpv5_NC0k9P_v6ZUCbLRAHxK1Euyysd0mm_00.woff2",
    "https://fonts.gstatic.com/s/heebo/v10/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EuyysdUmm.woff2",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.0/font/fonts/bootstrap-icons.woff2",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.0/font/fonts/bootstrap-icons.woff"
];



app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/shiftnow/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://media.architecturaldigest.com/",
                "https://jumanji.livspace-cdn.com/magazine/wp-content/uploads/",
                "https://assets-news.housing.com/news/wp-content/uploads/2020/04/22184310/Check-out-these-duplex-interior-design-ideas-FB-1200x700-compressed.jpg"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);





app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes)
app.use('/houses', houseRoutes)
app.use('/houses/:id/reviews', reviewRoutes)



// route to render the home page of the website.
app.get('/', (req, res) => {
    res.render('home')
});

// route to display all details of the user.
app.get('/profile', isLoggedIn, async (req, res) => {
    const wishlist = await Wishlist.find({ "user": `${req.user._id}` });
    const wishlistHouses = await House.find({ '_id': { $in: wishlist[0].home } });
    let i = 0;
    if (wishlistHouses.length < 1) {
        i = 1;
    } else {
        i = 2;
    }
    const houses = await House.find({ "owner": `${req.user._id}` });
    const user = await User.findById(req.user._id);
    res.render('users/userProfile', { wishlistHouses, houses, user, i })
})

// route to display all wishlited houses by the user.

app.get('/profile/wishlist', isLoggedIn, async (req, res) => {
    const wishlist = await Wishlist.find({ "user": `${req.user._id}` });
    if (wishlist.length < 1) {
        req.flash('error', 'No wishlisted houses');
        return res.redirect('/houses')
    } else {
        const houses = await House.find({ '_id': { $in: wishlist[0].home } });
        res.render('users/wishlist', { houses })
    }
})

//post route used to save the wishlited house in the database.

app.post('/profile/wishlist/:id', isLoggedIn, isOwnerNeg, async (req, res) => {
    const house = await House.findById(req.params.id);
    let wishlist = await Wishlist.find({ "user": `${req.user._id}` });
    if (wishlist.length > 0) {
        wishlist[0].home.push(house)
        await wishlist[0].save();
        req.flash('success', 'Added to wishlist');
        res.redirect('/houses');
    } else {
        wishlist = new Wishlist;
        wishlist.user = req.user._id;
        wishlist.home.push(house)
        await wishlist.save();
        req.flash('success', 'Added to wishlist');
        res.redirect('/houses');
    }
})

//route to render a form which helps to edit the details of the user.
app.get('/profile/edit', isLoggedIn, catchAsync(async (req, res) => {
    const user = req.user;
    res.render('users/edit', { user })
}));

//route to change the credentials of the user in the database.
app.put('/profile/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.user;
    const updateduser = await User.findByIdAndUpdate(id, { ...req.body });
    await updateduser.save();
    req.flash('success', 'Successfully updated the details');
    res.redirect('/profile')
}))

//route to remove a specific property from the wishlist
app.delete('/profile/wishlist/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const wishlist = await Wishlist.find({ "user": `${req.user._id}` });

    await Wishlist.findByIdAndUpdate(wishlist[0]._id, { $pull: { home: id } });
    req.flash('success', 'Successfully removed from wishlist');
    res.redirect('/profile/wishlist');
}));


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}!!!`)
})