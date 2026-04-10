const express = require('express')
const router = express.Router();
const Session = require('../models/Session');
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.post('/', authMiddleware, adminMiddleware, async(req , res)=>{
    const session = new Session(req.body)
    session.save();
    return res.json({message:"Session Added Successfully"})
})

router.get('/', async(req , res)=>{
    try {
        const session =  await Session.find();
        return res.json({data:session})
    } catch (error) {
        console.error("Fetch sessions error:", error);
        return res.status(500).json({ success: false, message: "Database error fetching sessions" });
    }
});

router.delete('/:id', authMiddleware, adminMiddleware, async(req,res)=>{
    const {id}= req.params
    const session = await Session.findByIdAndDelete(id);
    return res.json({message:"Deleted successfully"});
})

router.put('/:id', authMiddleware, adminMiddleware, async(req,res)=>{
    const {id} = req.params
    const session = await Session.findByIdAndUpdate(id,req.body)
    return res.json({message:"Updated Successfully"})
})
module.exports = router

