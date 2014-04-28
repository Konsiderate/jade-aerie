var express = require('express');
var router = express.Router();
var HomeView = require('../views/home')

/* GET home page. */
router.get('/', function(req, res) {
  var view = new HomeView();
  res.render(view, { title: 'Express' });
});

module.exports = router;
