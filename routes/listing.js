const express  = require('express')
const app= express();
const router = express.Router()
const Listing=require('../models/listing.js')
const wrapAsync=require('../utils/wrapAsync.js')
const {isLoggedIn, isOwner, validateListing} = require('../middleware.js')
const listingController = require('../controllers/listing.js')
const multer  = require('multer')
const {storage} = require('../cloudConfig.js')
const upload = multer({storage}) // file jo form se bhjenge vo uplod name ke folder mein save

router.route('/')
.get(wrapAsync(listingController.index))  //Index Route 
.post(isLoggedIn,
    upload.single('listing[image][url]'), 
    validateListing,
    wrapAsync(listingController.createListing)) //Create Route
 
//New Route 
router.get('/new',isLoggedIn,listingController.renderNewForm) //iss route ko :id se upr rkhna vrna new route as a id ki trah jaygi req

router.route('/:id')
.get(wrapAsync(listingController.showListing))  //Show Route (READ)
.put(isLoggedIn,
    isOwner,
    upload.single('listing[image][url]'), 
    validateListing,
    wrapAsync(listingController.updateListing)) //Update Route
.delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing)) //Delete Route


//Edit Route
router.get('/:id/edit',isLoggedIn,isOwner,wrapAsync(listingController.editListing))
 

module.exports= router