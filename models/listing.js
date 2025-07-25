const mongoose=require('mongoose')
const Schema=mongoose.Schema
const review = require('./review.js')

const listingSchema= new Schema({
    title:{
        type:String,
        required:true
    },
    description:String,
    // image:{
    //         type:String,
    //         default:"https://unsplash.com/photos/a-jellyfish-floats-elegantly-against-a-black-background-TLD1Ui2aWJg",
    //         set:(v)=>v===""?"https://unsplash.com/photos/a-jellyfish-floats-elegantly-against-a-black-background-TLD1Ui2aWJg":v,
    //     },
    image: {
        url:String,
        filename: String
    },
    price:Number,
    location:String,
    country:String,
    reviews:[{
        type: Schema.Types.ObjectId,
        ref:"Review"
    }],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
});

listingSchema.post('findOneAndDelete',async (listing)=> {
    if(listing){
        await review.deleteMany({_id: {$in :listing.reviews}})
    }
})

const Listing = mongoose.model ('Listing', listingSchema);

module.exports=Listing