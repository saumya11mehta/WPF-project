var express  = require('express');
var mongoose = require('mongoose');
var exphbs = require('express-handlebars');
var app      = express();
var bodyParser = require('body-parser');   
var db = require('./mod');
var database = require('./config/database');

app.engine('.hbs', exphbs.engine({ extname: '.hbs' ,runtimeOptions: {allowProtoPropertiesByDefault: true,allowProtoMethodsByDefault: true,}}));

// pull information from HTML POST (express4)
 
var port     = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
 
app.set('view engine', 'hbs');

app.get('/api/restaurants', async function(req, res) {
	let page = req.query.page;
	let perPage = req.query.perPage;
    let borough = req.query.borough;

    let restaurants = await db.getAllRestaurants(page,perPage,borough)
	console.log(await restaurants)
	res.json(await restaurants);
});

app.get('/api/restaurants/:id', async function(req, res) {
	let id = req.params.id;
	//test id 5eb3d668b31de5d588f4292a
    let restaurant = await db.getRestaurantById(id);
	console.log(await restaurant);
	res.json(await restaurant);
});

app.post('/api/restaurants', async function(req, res) {
	let building = req.body.building;
	let street = req.body.street;
	let zipcode = req.body.zipcode;
	let borough = req.body.borough;
	let cuisine = req.body.cuisine;
	let name = req.body.name;
	let restaurant_id = req.body.restaurant_id;
	data = {
		address: {building: building,street:street,zipcode:zipcode},
		borough: borough,
		cuisine: cuisine,
		name: name,
		restaurant_id: restaurant_id
	}

    let restaurants = await db.addNewRestaurant(data)
	console.log(await restaurants);
	res.send(await restaurants);
});

app.put('/api/restaurants/:id',async function(req, res) {
	let id = req.params.id;

	let building = req.body.building;
	let street = req.body.street;
	let zipcode = req.body.zipcode;
	let borough = req.body.borough;
	let cuisine = req.body.cuisine;
	let name = req.body.name;
	let restaurant_id = req.body.restaurant_id;
	if(typeof(id) != "undefined" && id != ""){
		var nameObj = {};
		var addressObj = {};
		var boroughObj = {};
		var cuisineObj = {};
		var resIdObj = {};

		var buildingObj = {};
		var streetObj = {};
		var zipcodeObj = {};


		if(name != ""){
			nameObj = {name : name};
		}
		if(building != ""){
			buildingObj = {building : building};
		}
		if(street != ""){
			streetObj = {street : street};
		}
		if(zipcode != ""){
			zipcodeObj = {zipcode : zipcode};
		}
		if(buildingObj != {} || streetObj != {} || zipcodeObj != {}){
			addressObj = {address:{ ...buildingObj, ...streetObj, ...zipcodeObj}};
		}
		if(borough != ""){
			boroughObj = {borough : borough};
		}
		if(cuisine != ""){
			cuisineObj = {cuisine : cuisine};
		}
		if(restaurant_id != ""){
			resIdObj = {restaurant_id : restaurant_id};
		}

		let data = {...nameObj,...addressObj,...boroughObj,...cuisineObj,...resIdObj}
		let restaurants = await db.updateRestaurantById(data,id)
		console.log(await restaurants);
		res.send(await restaurants);
	}else{
		res.send("Id should not be empty")
	}
});

app.delete('/api/restaurants/:id',async function(req, res) {
	let id = req.params.id;

	
	if(typeof(id) != "undefined" && id != ""){
		

		let restaurants = await db.deleteRestaurantById(id)
		console.log(await restaurants);
		res.send(await restaurants);
	}else{
		res.send("Id should not be empty");
	}
});





app.listen(port);
console.log("App listening on port : " + port);
