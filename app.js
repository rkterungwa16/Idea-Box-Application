var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Database
var firebase = require("firebase");

 // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCkDsLxigAvac53lsGhbTXUZMNVaLsLwHs",
    authDomain: "idea-box-d9ed0.firebaseapp.com",
    databaseURL: "https://idea-box-d9ed0.firebaseio.com",
    storageBucket: "idea-box-d9ed0.appspot.com",
    messagingSenderId: "598011124219"
  };
  firebase.initializeApp(config);

var db = firebase.database();
var ref = db.ref();
var usersRef = ref.child('user');
var userProductRef = ref.child('idea');

/*ref.once("value")
.then(function(snapshot) {
  console.log(snapshot.val());
  console.log(snapshot.key);
});

Promise.all ([
	userRef.once('value'), 
	userProductRef.once('value') 
	]).then(function (snaps) {
		var user = snaps[0].val();
		var userProducts = snaps[1].val();
	});
*/


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: "Your secret key"}));

//app.use('/', index);
//app.use('/users', users);

var Users = [];

app.get('/', function (req, res) {
	res.render('welcome');
});

/*app.get('/home', function (req, res) {
	res.render('createstore');
});
*/
app.get('/login', function (req, res) {
	res.render('login');
});


app.post('/login', function (req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;

	firebase.auth().signInWithEmailAndPassword(email, password)
	.then(function (user) {
		var user = {email: email, password: password, name: name};
		req.session.user = user;
		console.log( req.body.email+ ' ' + req.body.password);
	    res.redirect('/user/'+name);
	})
	.catch(function (error) {
		var errorCode = error.code;
		var errorMessage = error.message;
	    res.render('login', {message: errorMessage});
		console.log(error);
	});
});

/*app.get('/newstoreprofile', function (req, res) {
	res.render('newstoreprofile');
});*/

app.get('/user/:name', function (req, res) {
	if (req.session.user) {
		name = req.params.name.toLowerCase();
		query = {name: name};
		currentUser = req.session.user;
        res.render('newIdeaPost', {currentUser: currentUser});
		//Users.filter(function (user) {
		//	res.render('newstoreprofile', {user: user, currentStore: currentStore});
		//});
	}
})


/*app.get('/product', function (req, res) {
	res.render('addproduct');
})*/


app.post('/signup', function (req, res) {

	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;

	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then (function (user) {
		var newUser = {email: email, password: password, name: name};
		Users.push(newUser);
	    usersRef.push(newUser);
	    req.session.user = newUser;
	    console.log(Users);
	    res.redirect('/user/'+name);
	})
	.catch(function (error) {

		var errorCode = error.code;
		var errorMessage = error.message;
		res.render('welcome', {message: errorMessage});
		console.log(error);
		
    });

});

/*
app.post('/product', function (req, res) {
	
    res.redirect('/product'); 
	// ''/store/'+storename'/addproduct/'+product
});

app.post('/addproduct', function (req, res) {
	if (req.session.user) {
		var name = req.body.name;
		var price = req.body.price;
		var description = req.body.description;
		var email = req.session.user.email;
		var newProd = { email: email, name: name, price: price, description: description};
		userProductRef.push(newProd);
		res.render('addproduct');
	};
})


function checkSignIn(req, res, next) {
	if(req.session.user) {
		next(); // If session exists, proceed to page
	}
	else {
		var err = new Error('Not logged in!');
		console.log(req.session.user);
		next(err);
	}
}

app.get('/protected_page', function (req, res) {
	res.render('protected_page', {id: req.session.user.id});
});



app.get('/logout', function (req, res) {
	req.session.destroy (function () {
		console.log ('user logged out.');
	})
	res.redirect('/login');
});

app.use('/protected_page', function (err, req, res, next) {
	console.log(err);
	//User should be authenticated! Redirect him to log in
	res.redirect('/login');
});
*/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
app.listen(3000);
module.exports = app;
