'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);

var websiteSchema = mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url : {
    type: Number,
    // required: true
  } 
})

var Website = mongoose.model('Website', websiteSchema);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
app.post('/api/shorturl/new', async (req, res, next) => {
  let doesExist = await Website.findOne({original_url: req.body.url})
  if (doesExist) {
    return res.send('URL already exists!')
  }
  next();
})

app.post('/api/shorturl/new', async (req, res, next) => {
  let myRegex = /^https?:\/\//m
  if (myRegex.test(req.body.url)) {
    next()
  } else {
    return res.send('Not a valid URL')
  }
  
})
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post('/api/shorturl/new', async (req, res) => {
  let counter;
  await Website.countDocuments({}, (err, count) => {
    if (err) console.log('error in count')
    console.log({count})
    counter = count;
    console.log({counter, count})
  });
  console.log(counter)
  var website = new Website ({ 
    original_url: req.body.url,
    short_url: counter
  });
  website.save(function (err) {
  if (err) console.log(err);
  });
  res.json({
    original_url: req.body.url,
    short_url: counter
  })
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  await Website.find({short_url: Number(req.params.short_url)}, (err, website) => {
    err ? res.send('error') 
    : res.redirect(website[0].original_url)
  })
  
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});