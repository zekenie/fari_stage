const express = require("express");
const analyticsRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { requireUser } = require("./utils");
const { check, validationResult } = require('express-validator');
const cors = require("cors");
analyticsRouter.use(cors());

const {
  client,
  getRentalsTotals,
  getRentalsTotalsDates,
  getMarketTotals,
  getMarketTotalsDates,
  getChannelSubscribers,
  getTotalChannelLikes,
  getTotalChannelDisLikes,
  getTotalChannelViews,
  getTotalChannelComments,
  getTotalProductOrders,
  getTotalRentalOrders,
  getChannelRentals,
  getMarketBuys,
  commentCount,
  filterVideosByDate,
  filterOrdersByDate,
  getPurchaseItemsTotal,
  getRentalItemsTotal,
} = require("../db");

analyticsRouter.get("/rentaltotals/:channelid", check('channelid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { channelid } = req.params;
let errors = validationResult(req);  
 if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{  
try{
 const channelRentalTotals = await getRentalsTotals(channelid);
 res.send({total: channelRentalTotals});
}catch(error){
console.log('Oops, could not get rentals total', error);
  next(error)
}
}
});


analyticsRouter.get("/rentaltotalsdt/:channelid/:fromdt/:thrudt", async (req, res, next) => {
const { channelid, fromdt, thrudt } = req.params;
try{
 const channelRentalTotalsDt = await getRentalsTotalsDates(channelid, fromdt, thrudt);
  console.log(channelRentalTotalsDt)
 res.send({total: channelRentalTotalsDt});
}catch(error){
console.log('Oops, could not get rentals total', error);
  next(error)
}
});


analyticsRouter.get("/markettotals/:vendorid", check('vendorid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { vendorid } = req.params;
  let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{ 
try{
 const vendorTotals = await getMarketTotals(vendorid);
 res.send({total: vendorTotals});
}catch(error){
console.log('Oops, could not get marketplace total', error);
  next(error)
}
}
});


analyticsRouter.get("/markettotalsdt/:vendorid/:fromdt/:thrudt", async (req, res, next) => {
const { vendorid, fromdt, thrudt } = req.params;
  
try{
 const vendorTotalsDt = await getMarketTotalsDates(vendorid, fromdt, thrudt);
 res.send({total: vendorTotalsDt});
}catch(error){
console.log('Oops, could not get marketplace total', error);
  next(error)
}
});


analyticsRouter.get("/totalsubscribers/:id", check('id').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { id } = req.params;
 let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{  
try{
 const subsTotal = await getChannelSubscribers(id);
 res.send({total: subsTotal});
}catch(error){
console.log('Oops, could not get subs total', error);
  next(error)
}
}
});

analyticsRouter.get("/likestotal/:channelid", check('channelid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { channelid } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{    
try{
 const likesTotal = await getTotalChannelLikes(channelid);
 res.send({total: likesTotal});
}catch(error){
console.log('Oops, could not get likes total', error);
  next(error)
}
}
});

analyticsRouter.get("/dislikestotal/:channelid", check('channelid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { channelid } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{  
try{
 const dislikesTotal = await getTotalChannelDisLikes(channelid);
 res.send({total: dislikesTotal});
}catch(error){
console.log('Oops, could not get likes total', error);
  next(error)
}
}
});

analyticsRouter.get("/viewstotal/:channelid", check('channelid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { channelid } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{    
try{
 const dislikesTotal = await getTotalChannelViews(channelid);
 res.send({total: dislikesTotal});
}catch(error){
console.log('Oops, could not get likes total', error);
  next(error)
}
}
});


analyticsRouter.get("/commentstotal/:channelid", check('channelid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(),  async (req, res, next) => {
const { channelid } = req.params;
  let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{  
  
try{
 const commentsTotal = await getTotalChannelComments(channelid);
 res.send({total: commentsTotal});
}catch(error){
console.log('Oops, could not get comments total', error);
  next(error)
}
}
});

   
analyticsRouter.get("/rentedtotal/:channelid", check('channelid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { channelid } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{    
try{
 const rentedTotal = await  getTotalRentalOrders(channelid);
 res.send({total: rentedTotal});
}catch(error){
console.log('Oops, could not get rentals total', error);
  next(error)
}
}
});


analyticsRouter.get("/soldproductstotal/:vendorid", check('vendorid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { vendorid } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{    
try{
 const soldTotal = await getTotalProductOrders(vendorid);
 res.send({total: soldTotal});
}catch(error){
console.log('Oops, could not get products sold total', error);
  next(error)
}
}
});


analyticsRouter.get("/rentedcounts/:channelid", check('channelid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { channelid } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{  
try{
 const rentedCount = await getChannelRentals(channelid);
 res.send({total: rentedCount});
}catch(error){
console.log('Oops, could not get rentals count', error);
  next(error)
}
}
});



analyticsRouter.get("/marketsellcounts/:vendorid", check('vendorid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { vendorid } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{      
try{
 const productCount = await getMarketBuys(vendorid);
 res.send({total: productCount});
}catch(error){
console.log('Oops, could not get products count', error);
  next(error)
}
}
});



analyticsRouter.get("/product-sells/:productid", check('productid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { productid } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{        
try{
 const productSells = await getPurchaseItemsTotal(productid);
 res.send({pricing: productSells});
}catch(error){
console.log('Oops, could not get product sells count', error);
  next(error)
}
}
});

analyticsRouter.get("/rental-sells/:videoid", check('videoid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { videoid } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{  
try{
 const videoSells = await getRentalItemsTotal(videoid);
 res.send({pricing: videoSells});
}catch(error){
console.log('Oops, could not get product sells count', error);
  next(error)
}
}
});






analyticsRouter.get("/commentscount/:videoid", check('videoid').not().isEmpty().isNumeric().withMessage('Not a valid value').trim().escape(), async (req, res, next) => {
const { videoid } = req.params;
let errors = validationResult(req);
     if (!errors.isEmpty()) {
    return res.status(400).send({name: 'Validation Error', message: errors.array()[0].msg});
}else{         
try{
 const videocommentCount = await commentCount(videoid);
 res.send({total: videocommentCount});
}catch(error){
console.log('Oops, could not get comment count', error);
  next(error)
}
}
});

    
    
analyticsRouter.get("/videosfilter/:channelid/:fromdt/:thrudt", async (req, res, next) => {
const { channelid, fromdt, thrudt} = req.params;
try{
 const videosFiltered = await filterVideosByDate(channelid, fromdt, thrudt);
 res.send({timeframe: videosFiltered});
}catch(error){
console.log('Oops, could not filter videos by date', error);
  next(error)
}
});

analyticsRouter.get("/ordersfilter/:vendorid/:fromdt/:thrudt", async (req, res, next) => {
const { vendorid, fromdt, thrudt } = req.params;
try{
 const ordersFiltered = await filterOrdersByDate(vendorid, fromdt, thrudt);
 res.send({timeframe: ordersFiltered});
}catch(error){
console.log('Oops, could not filter orders by date', error);
  next(error)
}
});




module.exports = analyticsRouter;
