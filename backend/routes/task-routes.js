import express from 'express'
import { asyncWrap } from '../utils/asyncWrap.js'; 
 
import passport from 'passport'; 




const taskRouter=express.Router();

const protect = passport.authenticate('jwt-access', { session: false });

taskRouter.get('/task',protect,asyncWrap((req,res)=>{
    res.json({
        message:'todos endpoint'
    })
}))


taskRouter.post('/task',protect,asyncWrap((req,res)=>{
    res.json({
        message:'task post endpoint'
    })
}))


export default taskRouter