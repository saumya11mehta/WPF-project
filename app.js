/********************************************************************************* 
* 
* ITE5315 – Project 
* I declare that this assignment is my own work in accordance with Humber Academic Policy. 
* No part of this assignment has been copied manually or electronically from any other source 
* (including web sites) or distributed to other students. 
* 
* Group member Name: Saumya Mehta Student IDs: N01487261 Date: 2022/12/06 
* Group member Name: Siddhartha Choudhary Student IDs: N01568083 Date: 2022/12/06 
*********************************************************************************/
var express  = require('express');
var path = require('path');
const { body, query, validationResult } = require('express-validator')
var mongoose = require('mongoose');
var exphbs = require('express-handlebars');
var app      = express();
var bodyParser = require('body-parser');   
var db = require('./mod');
var database = require('./config/database');
require('dotenv').config()
const jwt=require('jsonwebtoken');

app.set('views', path.join(__dirname, process.env.ROUTESTRING, 'views'));

app.engine('.hbs', exphbs.engine({ extname: '.hbs' ,defaultLayout: 'main', layoutsDir: path.join(__dirname, process.env.ROUTESTRING, 'views', 'layouts'),partialsDir: path.join(__dirname, process.env.ROUTESTRING, 'views', 'partials'),runtimeOptions: {allowProtoPropertiesByDefault: true,allowProtoMethodsByDefault: true,}}));


// pull information from HTML POST (express4)
var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

//Sets the static resource directory to public
app.use(express.static(path.join(__dirname, 'public')));
 
app.set('view engine', 'hbs');

app.post('/api/login', (req,res)=>{
	console.log(req)
	//Authenticated User
	const userid = req.body.userid;
	const password = req.body.password;

	if(userid == process.env.USERID){
		if(password == process.env.PASSWORD){
			const user = { name : userid }
			const accessToken = jwt.sign(user, process.env.SECRETKEY)
			res.json({ accessToken : accessToken})
		}else{
			res.send('Authentication failed')
		}
	}else{
		res.send('Invalid User ID')
	}
})

function verifyToken(req,res,next){
	const bearerHeadr = req.headers['authorization']
	if(typeof bearerHeadr != 'undefined'){
		const bearer = bearerHeadr.split(' ')
		const bearerToken = bearer[1]
		req.token = bearerToken
		jwt.verify(req.token, process.env.SECRETKEY, (err, decoded)=> {
			if (err){
				res.sendStatus(403)
			}else{
				console.log(decoded);
				next()
			}
		});
	}else{
		res.send('Authentication failed');
	}
}	

app.get('/api/restaurants',verifyToken,[
	query('borough').optional().isString().withMessage('Only letters and digits allowed in borough.'),
	query('page').exists(),
	query('perPage').exists(),
], async function(req, res) {
	const errors = validationResult(req);
	if (errors.isEmpty()) {
		let page = req.query.page;
		let perPage = req.query.perPage;
		let borough = req.query.borough;

		let restaurants = await db.getAllRestaurants(page,perPage,borough)
		console.log(await restaurants)
		res.json(await restaurants);
	}else{
		res.status(400).json({
			success: false,
			errors: errors.array()
		});
	}
});

app.get('/restaurants', async function(req, res) {
	res.render('restaurants',{ title: 'Search Restaurants'});
});


app.post('/restaurants', async function(req, res) {
	let page = req.body.page;
	let perPage = req.body.perPage;
    let borough = req.body.borough;

    let restaurants = await db.getAllRestaurants(page,perPage,borough)
	console.log(await restaurants)
	// res.json(await restaurants);
	res.render('search-results',{ title:'Results',restaurants: JSON.parse(JSON.stringify(await restaurants)) });
});

app.get('/api/restaurants/:id',verifyToken, async function(req, res) {
	let id = req.params.id;
	//test id 5eb3d668b31de5d588f4292a
    let restaurant = await db.getRestaurantById(id);
	console.log(await restaurant);
	res.json(await restaurant);
});

app.post('/api/restaurants',verifyToken, async function(req, res) {
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

app.put('/api/restaurants/:id',verifyToken,async function(req, res) {
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
		let restaurants = await db.updateRestaurantById(data,id);
		console.log(await restaurants);
		res.send(await restaurants);
	}else{
		res.send("Id should not be empty")
	}
});

app.delete('/api/restaurants/:id',verifyToken,async function(req, res) {
	let id = req.params.id;

	
	if(typeof(id) != "undefined" && id != ""){
		let restaurants = await db.deleteRestaurantById(id)
		console.log(await restaurants);
		res.send(await restaurants);
	}else{
		res.send("Id should not be empty");
	}
});




db.initialize(database.url).then(()=>{
	app.listen(port);
	console.log("App listening on port : " + port);
}).catch((err)=>{
	console.log("A error has been occurred while connecting to database."); 
})

