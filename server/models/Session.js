const mongoose = require ('mongoose');

const sessionSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    startdate:{
         type:String,
        required:true
    },
    enddate:{
         type:String,
        required:true
    },
    status:{
        type:String
    }
},
{
    timestamps:true
}
)

module.exports = mongoose.model('Session',sessionSchema);