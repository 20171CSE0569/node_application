const { urlencoded } = require('body-parser');
const bodyParser = require('body-parser');
const express = require('express');
var router = express.Router();
const bcrypt= require('bcryptjs');
var ObjectId = require('mongoose').Types.ObjectId;
var jwt =require('jsonwebtoken');
var { bankData } = require('../models/bankdetails');
var { registermodel } = require('../models/register');
var secretKey = "dhgfdhgfdhgfdcghdfcgdcgd";
var urlencodedParser = bodyParser.json();
//get all bankdetails
router.get('/', (req, res) => {
    bankData.find((err, docs) => {
        if (!err) { res.send(docs); }
        else { console.log('Error in Retriving bankDetails :' + JSON.stringify(err, undefined, 2)); }
    });
});

//get data by id
router.get('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);

        bankData.findById(req.params.id, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Retriving  details by id.:' + JSON.stringify(err, undefined, 2)); }
    });
});

//add bank details
router.post('/', (req, res) => {
    var bank = new bankData({
        bankName: req.body.bankName,
        comments: req.body.comments,
        accountNumber: req.body.accountNumber,
        routingNumber: req.body.routingNumber,
        swiftCode: req.body.swiftCode,
        commentedDate: req.body.commentedDate,
    });
    bank.save((err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in Employee Save :' + JSON.stringify(err, undefined, 2)); }
    });
});

router.put('/:id', (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send(`No record with given id : ${req.params.id}`);

    var bank = {
        bankName: req.body.bankName,
        comments: req.body.comments,
        accountNumber: req.body.accountNumber,
        routingNumber: req.body.routingNumber,
        swiftCode: req.body.swiftCode,
        commentedDate: req.body.commentedDate,
    };
    bankData.findByIdAndUpdate(req.params.id, { $set: bank }, { new: true }, (err, doc) => {
        if (!err) { res.send(doc); }
        else { console.log('Error in bankdetails Update :' + JSON.stringify(err, undefined, 2)); }
    });
});

// router.put('/update',urlencodedParser, (req, res) => {
//     console.log("req values", req);
//     if (!ObjectId.isValid(req.body._id))
//         return res.status(400).send(`No record with given id : ${req.body._id}`);

//     var bank = {
       
//         comments: req.body.comments,
//         commentedDate: req.body.commentedDate,
//     };
//     bankData.findByIdAndUpdate(req.body._id, { $set: bank }, { new: true }, (err, doc) => {
//         if (!err) { res.send(doc); }
//         else { console.log('Error in bankdetails Update :' + JSON.stringify(err, undefined, 2)); }
//     });
// });
router.post('/register', async(req,res) => {
    const registerUserData = {
        username: req.body.username,
        email : req.body.email,
        password : req.body.password,
    }
    const salt = await bcrypt.genSalt(10)
    await bcrypt.hash(req.body.password , salt).then(hashedPassword => {
        if(hashedPassword) {
            console.log('hashed password' , hashedPassword)
            registerUserData.password = hashedPassword
        }
    })

    await registermodel.create(registerUserData).then(userStoredData => {
        if(userStoredData && userStoredData._id) {
            console.log('user stored data' , userStoredData)
            res.json({status:'ok' , data : userStoredData})
        }
    }).catch(err => {
        if(err) {
            res.json({status:'error' , data : err})
        }
    })
})
// router.post('/login', async(req,res) => {
//     const email = req.body?.email
//     const password = req.body?.password
//     await registermodel.findOne({email: email}).then(existUser => {
//         console.log("exit user", exituser);
//         if(existUser && existUser._id) {
//             bcrypt.compare(password, existUser?.password,function(err, response) {
//                 if(!err)
//                 {
//                     if(response)
//                     {
//                         const authToken = jwt.sign({_id: existUser._id, email:existUser.email}, secretKey,
//                             {
//                                 expiresIn:'1h'
//                             })
//                             res.json({status:'ok', data:{token:authToken}})
//                     }else if(!response)
//                     {
//                         res.json({status:'ok', data:{existUser, response}})
//                     }
//                 }
//             })
//         }
//     }).catch(err =>{
//         res.json({status:'ok', data:"Something went wrong"})
//     })


// })

router.post('/login', async(req,res) => {
    const email = req.body?.email
    const password = req.body?.password
    console.log('details', email, password);
    if(email && password) {
    await registermodel.findOne({email: email}).then(existUser => {
        if(existUser && existUser._id) {
            bcrypt.compare(password, existUser?.password,function(err, response) {
                if(!err && response) {
                   const auth = jwt.sign(
                       { user_id: existUser._id, email },
                       'secretKey'
                     );
                   res.json({status: 'ok',loginUser : true, data: {existUser , response ,auth}});
                } else {
                   res.json({status: 'warn', loginUser : false, data: 'Please enter valid password'});
                }
            })   
        } else {
            res.json({status: 'warn', loginUser : false, data: 'Please enter valid password'});

        }
        }, (error) => {
            res.json({status: 'error' , data : error})
        })
    }
});
module.exports = router;
