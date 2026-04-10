const express = require('express')
const router = express.Router();
const Subject = require('../models/Subject');
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

router.post('/', authMiddleware, adminMiddleware, async(req , res)=>{
    try {
        const subject = new Subject(req.body);
        await subject.save();
        return res.status(201).json({ success: true, message: "Subject Added Successfully", data: subject });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
})

router.get('/', async(req , res)=>{
    try {
        const { courseId, batchId } = req.query;
        const filter = {};
        if (courseId) filter.courseId = courseId;
        if (batchId) filter.batchId = batchId;
        
        const subjects = await Subject.find(filter).sort({ order: 1 });
        return res.json({ success: true, data: subjects });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', authMiddleware, adminMiddleware, async(req,res)=>{
    const {id}= req.params
    const subject = await Subject.findByIdAndDelete(id);
    return res.json({message:"Deleted successfully"});
})

router.put('/:id', authMiddleware, adminMiddleware, async(req,res)=>{
    const {id} = req.params
    const subject = await Subject.findByIdAndUpdate(id,req.body)
    return res.json({message:"Updated Successfully"})
})
module.exports = router

