var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var http = require('http');

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
var userRef = db.ref('user/');
var userIdeaRef = db.ref('idea/');


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

// port that server will listen on
var port = 3000;

// start listening...
//app.listen(port);
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(port);
console.log('Express server listening on port '+port);

var Users = [];

userRef.on("value", function(snapshot) {
   console.log('This is snap', snapshot.val());
}, function (error) {
   console.log("Error: " + error.code);
});

userRef.orderByChild("email").equalTo("terungwakombol@gmail.com").on("child_added", function(data) {
   console.log("Equal to filter: " + data.val().name);
});
var arr = [];
var marr = [];
userIdeaRef.orderByValue().on("value", function(data) {
   	console.log('userIdeaRef', data.val());
   	data.forEach(function (data) {
   		console.log("The " + data.key + " rating is " + data.val())
   		arr.push(data.val());
   	});
   	console.log(arr[0]);
   	
});

userIdeaRef.orderByChild("time").on("child_added", function(data) {
   			//console.log('This is get', data.val());
   			
   			//marr.push(data.val());
   			
		});

console.log('this is array', arr);



app.get('/', function (req, res) {

	if (req.session.user) {

		userIdeaRef.orderByValue().on("value", function(data) {
   			console.log('userIdeaRef', data.val());
   			data.forEach(function (data) {
   			console.log("The " + data.key + " rating is " + data.val())
   			arr.push(data.val());
   			var reverseArr = arr.reverse()

   			res.render('homepage', {user: req.session.user, data: reverseArr});
   	});
   	
});

	} else {

		res.render('welcome');
	}

});

app.get('/login', function (req, res) {
	res.render('login');
});

app.get('/submitIdea', function (req, res) {
	res.render('newIdeaPost1');
})


app.post('/login', function (req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var name;

	userRef.orderByChild("email").equalTo(email).on("child_added", function(data) {
       console.log("Equal to filter: " + data.val().name);
       name = data.val().name;
    });

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



app.get('/user/:name', function (req, res) {
	if (req.session.user) {
		name = req.params.name.toLowerCase();
		query = {name: name};
		currentUser = req.session.user;
        res.render('newIdeaPost1', {currentUser: currentUser});
	}
})



app.post('/signup', function (req, res) {

	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;

	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then (function (user) {
		var newUser = {email: email, password: password, name: name};
		Users.push(newUser);
	    userRef.push(newUser);
	    req.session.user = newUser;
	    console.log(Users);
	    res.redirect('/user/'+ name);
	})
	.catch(function (error) {

		var errorCode = error.code;
		var errorMessage = error.message;
		res.render('welcome', {message: errorMessage});
		console.log(error);
		
    });

});


app.post('/postIdea', function (req, res) {
	if (req.session.user) {
		var comment_author = req.session.user.name.toLowerCase();
		var comment = req.body.comment;
		var title = req.body.comment_title
		var email = req.session.user.email;
		var time = new Date().toISOString()
		var newCommentAuthor = { email: email,
		 name: comment_author,
		 title: title,
		 likes: [email], 
		 time: time,
		 body: comment
		};

		userIdeaRef.push(newCommentAuthor);
		console.log(comment_author + ' has posted a new status')
		io.sockets.emit('newIdea', {newCommentAuthor: newCommentAuthor});
		res.redirect('/');
	}

	else {
		res.redirect('/');
	}
})




app.get('/logout', function (req, res) {
	req.session.destroy (function () {
		console.log ('user logged out.');
	})
	res.render('welcome');
});

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

module.exports = app;