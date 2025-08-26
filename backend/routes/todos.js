import express from 'express'
import { asyncWrap } from '../utils/asyncWrap.js'; 
 
import passport from 'passport'; 




const todosRouter=express.Router();

const protect = passport.authenticate('jwt-access', { session: false });

todosRouter.get('/todos',protect,asyncWrap((req,res)=>{
    res.json({
        message:'todos endpoint'
    })
}))


export default todosRouter