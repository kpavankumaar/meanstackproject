"use strict";
var express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    app = express(),
    crypto = require('crypto'),
    MongoClient = require('mongodb').MongoClient,
    url = "mongodb://localhost:27017/";


    console.log('dirname ',__dirname);
    // prepare mongo db 
function createDb(dbCollectionName , userDetails){    
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("users");
        dbo.collection(dbCollectionName).insertOne(userDetails, function (err, res) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
        });
    });
}
function getDataFromDb(dbCollectionName,userDetails,callback){
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("users");
        var cursor = dbo.collection(dbCollectionName).find(userDetails);
        var data = cursor.forEach(function(doc){
            console.log('docDetails ', doc)
            callback(doc);
        })
        db.close();
        // collectedData = data.then(function(res){
        //     console.log(res);
        // });
        // dbo.collection(dbCollectionName).find(userDetails, function (err, res) {
        //     if (err) throw err;
        //     console.log("*************************got*************" ,res);
        //     collectedData = res;
        //     db.close();
        // });
    });
    
}


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//The dist folder has our static resources (index.html, css, images)
app.use(express.static(__dirname + '/dist/meanproject'));



app.get('/api/customers', (req, res) => {
    res.json(customers);
});

app.get('/customers', (req, res) => {
    console.log(req.query);
    console.log(req.headers.token)
    var userData = req.query;
    var tokenData = {tokenid: req.headers.token}
    getDataFromDb("tokenCollections", tokenData,function(data){
        // token validation and session expiration
        if (typeof (data) == "object" && data.expires > Date.now()){
            // get data from db
            getDataFromDb("usernames",userData,function(userNameData){
                res.status(200);
                res.json(userNameData);
            })
        }else{
            res.status(400);
            res.json("invalid token or session has expired");
        }
    })
    // let customerId = +req.params.id;
    // let selectedCustomer = {};
    // for (let customer of customers) {
    //     if (customer.id === customerId) {
    //         selectedCustomer = customer;
    //         break;
    //     }
    // }
    // res.json(selectedCustomer);
});

// signup 
app.post('/customers', (req, res) => {
    // required data for signup _id : phone , password 
    // hash the password
    console.log('customers req.body', req.body)
    let postedCustomer = req.body;
    let hashedPassword = hash(postedCustomer.password);
    
    let userDetails = {
        _id : postedCustomer.phone,
        hashedPassword: hashedPassword
    }
    createDb('userCredentials',userDetails);
    
    res.json(postedCustomer);
});

app.post('/login', (req, res) => {

    let postedCustomer = req.body;
    let searchUserDetails = {"_id" : postedCustomer.phone};
    // get the check from database 
    let data = "";
    getDataFromDb('userCredentials',searchUserDetails,function(dbData){
        data = dbData;
        // console.log('data from callback function ', typeof(data));
        if (typeof (data) == 'object') {
            let hashedPassword = hash(postedCustomer.password);
            if (data.hashedPassword == hashedPassword) {
                // create a token 
                let token = createRandomToken(20);
                let expires = Date.now() + 1000 * 60 * 60;
                let updateTokenData = {
                    _id: postedCustomer.phone,
                    tokenid: token,
                    expires: expires
                }
                createDb('tokenCollections', updateTokenData);
                res.status(200);
                res.header({'content-type':'application/json'});
                res.json(updateTokenData);
            };
        } else {
            res.status(400);
            res.json('invalid credentials');
        }
    });
    
    
    // prepare the json object to send token and expiration time 
    // res.json(true);
});

app.post('/api/auth/logout', (req, res) => {
    res.json(true);
});

// redirect all others to the index (HTML5 history)
app.all('/*', function (req, res) {
    
    res.sendFile(__dirname + '/dist/meanproject/index.html');
});

app.listen(3000);

console.log('Express listening on port 3000.');

// hash the password 

var hash = function (str) {
    if (typeof (str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', 'Password').update(str).digest('hex');
        return hash;
    } else {
        return false;
    }

}
// create token 
var createRandomToken = function (lengthOfToken) {
    lengthOfToken = typeof lengthOfToken == 'number' && lengthOfToken > 0 ? lengthOfToken : false;
    if (lengthOfToken) {
        // define all the possible characters that can go into the string
        var possibleCharacters = 'abcdefghijklmonpqrstuvwxyz012345789';
        var randomStr = '';
        // console.log('str',str);
        for (var i = 0; i < lengthOfToken; i++) {
            // console.log('str inside for loop', str,i);
            var randomCharater = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            randomStr += randomCharater
            // console.log('randomStr', randomStr);
        }
        // return the final string
        return randomStr;
    } else {
        return false;
    }
}
//Open browser
// var opn = require('opn');

// opn('http://localhost:3000').then(() => {
//     console.log('Browser closed.');
// });