// This file consists of callback functions which are used by the house routes

const House = require('../models/house');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


// This function is used to list all the houses in the database 

module.exports.index = async (req, res) => {

	const { search } = req.query;
	if (!search) {
		const houses = await House.find({});
		res.render('houses/index', { houses })
	} else {
		const houses = await House.find({ $text: { $search: search } })
		if (houses.length < 1) {
			const home = await House.find({});
			res.render('houses/index', { houses: home })
		} else {
			res.render('houses/index', { houses })
		}

	}
}

// This function is used to filter houses by applying the appropriate filters

module.exports.filter = async (req, res) => {
	const { aptType, rentRange, availability, parking } = req.query;
	let houses = await House.find({});
	if (aptType) {
		houses = await House.find({ roomType: { $in: aptType } });
	}
	if (rentRange) {
		houses = await houses.filter(h =>
			h.price < rentRange * 1000
		)
	}
	if (availability) {
		houses = await houses.filter(h =>
			h.availability == availability
		)
	}
	if (parking) {

		if (parking.length == 2) {
			houses = await houses.filter(h =>
				h.parking == parking[0] || parking[1]
			)
		} else {
			houses = await houses.filter(h =>
				h.parking == parking
			)
		}
	}
	res.render('houses/index', { houses })
}

// This function renders a form for adding property

module.exports.renderNewForm = (req, res) => {
	res.render('houses/new')
}

// This function collects data from the form and push it to database

module.exports.createHouse = async (req, res, next) => {
	const geoData = await geocoder.forwardGeocode({
		query: req.body.house.location,
		limit: 1
	}).send()

	const house = new House(req.body.house);
	house.geometry = geoData.body.features[0].geometry;
	house.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
	house.owner = req.user._id;
	await house.save();
	req.flash('success', 'Successfully added a new property');
	res.redirect(`/houses/${house._id}`)
}

// This function displays full details about a property including the reviews

module.exports.showHouse = async (req, res) => {
	const house = await House.findById(req.params.id).populate({
		path: 'reviews',
		populate: {
			path: 'author'
		}
	}).populate('owner');
	if (!house) {
		req.flash('error', 'Cannot find the property');
		res.redirect('/houses');
	}
	res.render('houses/show', { house })
}

// This function renders a edit form for the property

module.exports.renderEditForm = async (req, res) => {
	const { id } = req.params;
	const house = await House.findById(id)
	if (!house) {
		req.flash('error', 'Cannot find the property');
		res.redirect('/houses');
	}
	res.render('houses/edit', { house })
}

// This function collects data from the edit form and update it in the database

module.exports.updateHouse = async (req, res) => {
	const { id } = req.params;
	const house = await House.findByIdAndUpdate(id, { ...req.body.house });
	const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
	house.images.push(...imgs);
	await house.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await house.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
	}
	req.flash('success', 'Successfully updated the property details');
	res.redirect(`/houses/${house._id}`)
}

// This function removes a particular property from the database and it's related reviews

module.exports.deleteHouse = async (req, res) => {
	const { id } = req.params;
	await House.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted a property');
	res.redirect('/houses');
}