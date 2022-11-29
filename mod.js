const { MongoClient } = require("mongodb");
var database = require('./config/database');
var express  = require('express');
let mongoose = require('mongoose');
var Restaurant = require('./models/restaurant');


// Replace the uri string with your connection string.
const uri = database.url;

mongoose.connect(database.url)
  .then(() => {
    console.log("Connected to database from mod.js");
  }).catch(err=> console.log(err));

function initialize()
{
  // Database connection
  mongoose.connect(database.url)
  .then(() => {
    console.log("Connected to database from mod.js");
  }).catch(err=> console.log(err));
}

async function addNewRestaurant(data){
  try {
    await Restaurant.create(data);
    return "Added new restaurant successfully";
  }
  catch(err){
    return "Failed to add restaurant data";
  }
}

async function getAllRestaurants(page, perPage, borough)
{
  try {
    let skip = perPage * (page-1);
    if(typeof(borough) != "undefined" && borough!=""){
      data = {borough:borough};
    }else{
      data = {};
    }
    let result = await Restaurant.find(data).skip(skip).limit(perPage);
    return result;
  }
  catch(err){
    return "Failed to find restaurant";
  }
}

async function getRestaurantById(id)
{
  try {
    let result = await Restaurant.findById(id);
    return result;
  }
  catch(err){
    return "Failed to find restaurant by id";
  }
}

async function updateRestaurantById(data,id)
{
  try {
    //this code depends upon the data which we will get from the frond end i.e. routing
    let result = await Restaurant.findByIdAndUpdate(id,data);
    return "Updated restaurant successfully";
  }
  catch(err){
    return "Failed to update restaurant with id";
  }
}

async function deleteRestaurantById(id)
{
  try{
    let result = await Restaurant.findByIdAndDelete(id);
    return "Deleted restaurant successfully";
  }
  catch(err){
    return "Failed to delete restaurant with id";
  }
}

module.exports = {initialize,addNewRestaurant,getAllRestaurants,getRestaurantById,updateRestaurantById,deleteRestaurantById};