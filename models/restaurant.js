// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Int32 = require('mongoose-int32').loadType(mongoose);
const Double = require('@mongoosejs/double');
var Schema = mongoose.Schema;

const GradeSchema = new Schema({
    date:Date,
    grade:String,
    score:Int32
}, { _id : false });

const AddressSchema = new Schema({
    building : String,
    coord: {
        type: [Double],
        default: undefined
    },
    street:String,
    zipcode:String
}, { _id : false })


RestaurantSchema = new Schema({
    address : AddressSchema,
    borough : String,
	cuisine : String,
    grades : {
        type: [GradeSchema],
        default: undefined
    },
    name : String,
    restaurant_id : String 
});
module.exports = mongoose.model('Restaurant', RestaurantSchema);