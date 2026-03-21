const mongoose = require ('mongoose');

const subjectSchema = new mongoose.Schema({
    subjectname:{
        type:String,
        required:true
    },
    description:{
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

module.exports = mongoose.model('Subject',subjectSchema);