const { userModle, postmodle } = require('./db');
const express = require('express')
const jwt=require('jsonwebtoken')
const z = require('zod')
const dns= require('dns')
const mongoose=require('mongoose')

const app = express();
const hiddenkey = "123"
app.use(express.json());


/// connect mongodb
dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

mongoose.connect('mongodb+srv://sarthak:sarthak773@cluster0.8fpcbj8.mongodb.net/Post')
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((e) => {
        console.log("DB Connection Error:", e);
    });


//zod
const pass_validation =  z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(50, "Password must be less than 50 characters");
  const user_validation = z.string().min(3).max(20)
  //endpoints



app.post('/signup',async(req,res)=>{
const username= req.body.username;
const password = req.body.password;
const validate_pass = pass_validation.safeParse(password)
const validate_user = user_validation.safeParse(username)
if(!validate_pass.success || !validate_user.success){
   return res.json({msg:'credential wrong'})
}
else{
    const newUser=await userModle.create({
            username:username,
            password:password
     })
   const token= jwt.sign({username:username,userId: newUser._id,
        },hiddenkey)
  
     return res.json({msg:"user created succefully", token:token})
}

})






app.post('/signin',async(req,res)=>{
    const { username, password } = req.body;
    const user = await userModle.findOne({ username, password });
    if(!user){
     return res.status(401).json({msg:'username or password is wrong'})
    }

    const token=jwt.sign({username:user.username,userId:user._id},hiddenkey)
    return res.json({msg:'you are sucesfully login', token:token})
})
app.listen(3000,()=>{
    console.log("server is running at port 3000")
})
//auth middleware
function auth(req,res,next){
   const tokenx=req.headers.authorization;
   if(!tokenx){
      return res.json({msg:"token is missing"})
   }
   const token=tokenx.split(" ")[1]
   const verifyuser = jwt.verify(token,hiddenkey)
   if(!verifyuser){
      res.json({msg:'you are verufiyed'})
   }
   req.user=verifyuser;
   next()


}
// create post endpoint
app.post('/create-post',auth,async(req,res)=>{
   const username = req.user.username
   const userId=req.user.userId
   const content = req.body.content
   await postmodle.create({content:content,author:userId})
   res.json({msg:"post cretated"})



})
app.get('/post',auth,async(req,res)=>{
    const user=await postmodle.find().populate('author')
    res.json({msg:user})
})
