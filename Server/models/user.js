const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    photo: {
        type: String
    },
    dob: {
        type: Date
    },
    bloodGroup: {
        type: String,
        enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'],
        required: true
    },
    height:{
        type: String
    },
    weight:{
        type:Number
    },
    identificationMark:{
        type:String
    },

    allergies:[{
        type:String
    }],
    medicalConditions:[{
        type:String
    }],
    currentMedications: {
        type:String
    },
    emergencyContacts: [
        {
            name:String,
            relation:String,
            phone:String
        }
    ],
    insurance:{
        providerName: {
            type:String
        },
        policyNumber: {
            type:String
        },
        validUntil : {
            type:Date
        },
        medicalHelpline:{
            type:String
        }
    },

    isActive: {
        type: Boolean,
        default:true
    },
    createdAt: {
        type:Date,
        default:Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);