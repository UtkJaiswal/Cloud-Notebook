const express=require('express');
const router=express.Router();
const { body, validationResult } = require('express-validator');
const User=require('../models/User');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = 'JaiswalBro$';

//ROUTE 1: Create a User using :POST "/api/auth/createuser". No login reuqired
router.post('/createuser',[
    body('email','Enter a valid email').isEmail(),
    body('name','Name must be atleast 3 characters').isLength({min:3}),
    body('password',"Password must be atleast 5 characters").isLength({min:5})
],async (req,res)=>{
    let success=false;
    //If there are errors return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }

    //Check whether the email already exists or not
    try{

    let user= await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({success,error:"Sorry, a user with this email already exists"})
    }

    //Generating salt and secured password
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password,salt);

    //Create a new user
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass
      })

      const data = {
          user:{
              id:user.id
          }
      }
      const authtoken = jwt.sign(data,JWT_SECRET)
      //res.json(user)
      success=true;
    res.json({success, authtoken})
    } catch(error){
        console.error(error.message)
        res.status(500).send("Internal error occured");
    }
})

//ROUTE 2: Authenticate a User using :POST "/api/auth/login". No login required
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password',"Password cannot be empty").exists(),
],async(req,res)=>{
    let success=false
    //If there are errors return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {email,password} = req.body;
    try {
        let user= await User.findOne({email});
        if(!user){
            success=false
            return res.status(400).json({error:"Login with correct credentials"})
        }
        const passwordCompare= await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            success=false
            return res.status(400).json({success,error:"Login with correct credentials"})
        }
        const data = {
            user:{
                id:user.id
            }
        }
        const authtoken = jwt.sign(data,JWT_SECRET)
      success = true;
      res.json({success,authtoken})
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal error occured");
    }
})
//ROUTE 3: Get logged in User details using :POST "/api/auth/getuser". Login required
router.post('/getuser',fetchuser,async (req,res)=>{
    try {
        userId=req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user )
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal error occured");
    }})
module.exports=router;