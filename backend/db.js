const mongoose = require('mongoose')

const user = new mongoose.Schema({username:String,password:String})
const postSchema = new mongoose.Schema({
    content: String,
    author: {
        type: mongoose.Schema.Types.ObjectId, // Standard Mongoose type definition
        ref: 'user'                           // Models ke naam se match karna chahiye
    }
});


// m

const userModle= mongoose.model("user",user)
const postmodle=mongoose.model("posts",postSchema)
module.exports = {
    userModle,
    postmodle
};
