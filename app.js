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

// Setup firebase variables
var db = firebase.database();
var userRef = db.ref('user/');
var userIdeaRef = db.ref('idea/');
var commentIdeaRef = db.ref('comment/');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: "Your secret key"}));

// start listening...
//app.listen(port);
var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(process.env.PORT || 3000);
console.log('Express server listening on port '+ 3000);

var Users = [];

var arr = [];

// Read all data in ideas collection
userIdeaRef.orderByValue().on("value", function(data) {
   	data.forEach(function (data) {
   		arr.push(data.val());
   	});  	
});


// User can like only once
function oneLikePerUser (data, marr) {
	var pos = marr.indexOf(data);
	if (pos < 0) {
		marr.push(data);
		return marr;
	}
	else {
		marr.splice(pos, 1);
		return marr;
	}
}

/*
*  Handler for welcome page and user home page
*/ 
app.get('/', function (req, res) {
	if (req.session.user) {
		var reverseArray = arr.reverse();
   		res.render('homepage', {user: req.session.user, data: reverseArray});
	} else {
		res.render('welcome');
	}
});

/*
 *  Login link to login page
*/ 
app.get('/signup', function (req, res) {
	res.render('signup');
});

app.get('/login', function (req, res) {
	res.redirect('/');
})

/*
 *  Submit an idea link to general feed page
*/ 
app.get('/submitIdea', function (req, res) {
	res.render('newIdeaPost1');
})

/*
 *  App Sign in using firebase authentication
*/ 
app.post('/login', function (req, res) {
	var email = req.body.email;
	var password = req.body.password;
	var name;
    // Get user data equivalent to this email
	userRef.orderByChild("email").equalTo(email).on("child_added", function(data) {
       console.log("Equal to filter: " + data.val().name);
       name = data.val().name;
    });
    // Firebase sign in
	firebase.auth().signInWithEmailAndPassword(email, password)
	.then(function (user) {
		var user = {email: email, password: password, name: name};
		req.session.user = user;
		console.log( req.body.email + ' ' + req.body.password);
	    //res.redirect('/user/'+name);
	    res.redirect('/');
	})
	.catch(function (error) {
		var errorCode = error.code;
		var errorMessage = error.message;
	    res.render('login', {message: errorMessage});
		console.log(error);
	});
});

/*
 *  User profile page
*/ 
app.get('/user/:name', function (req, res) {
	if (req.session.user) {
		name = req.params.name.toLowerCase();
		query = {name: name};
		currentUser = req.session.user;
        res.render('newIdeaPost1', {currentUser: currentUser});
	}
})

/*
 *  App signup using firebase email and password authentication
*/ 
app.post('/signup', function (req, res) {

	var email = req.body.email;
	var password = req.body.password;
	var name = req.body.name;
	// create email and password with firebase authentication
	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then (function (user) {
		var newUser = {email: email, password: password, name: name};
	    userRef.push(newUser);
	    req.session.user = newUser;
	    //res.redirect('/user/'+ name);
	    res.redirect('/');
	})
	.catch(function (error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		res.render('welcome', {message: errorMessage});
		console.log(error);		
    });
});

/*
 *  Update likes
*/ 
app.post('/postIdea', function (req, res) {
	if (req.session.user) {
		var idea_author = req.session.user.name.toLowerCase();
		var comment = req.body.comment;
		var title = req.body.comment_title
		var email = req.session.user.email;
		var time = new Date().toISOString();
		var id = new Date().valueOf();
		var likeCount = 0;
		var newIdeaAuthor = { email: email,
		 name: idea_author,
		 title: title,
		 likes: [email], 
		 time: time,
		 body: comment,
		 likeCount: likeCount,
		 _id: id
		};
		// Post idea data to idea collections in database
		userIdeaRef.push(newIdeaAuthor);
		console.log(idea_author + ' has posted a new status')
		io.sockets.emit('newIdea', {newIdeaAuthor: newIdeaAuthor});
		// Later add new feature: append ideas to userprofile
		// Jade construct to render all ideas posted by this user
		// Get all ideas posted by this user
		res.redirect('/');
	}
	else {
		res.redirect('/');
	}
})

/*
 * User comment for each idea post
*/
app.post('/addComment', function (req, res) {
	if (req.session.user) {
		var uid;
		var data;
		var email = req.session.user.email;
		var comment_author = req.session.user.name.toLowerCase();
		var comment = req.body.commentBody;
		var id = parseInt(req.body.id);
		var time = new Date().toISOString();
		var ideaComment = {
			name: comment_author,
			comment: comment,
			time: time
		};
        console.log('comment author', ideaComment);
        console.log('Type of id', typeof id);
		userIdeaRef.orderByChild("_id").equalTo(id).on("child_added", function (snapshot) {
  			console.log('The comment key', snapshot.key);
  			console.log('The current post', snapshot.val());
  			uid = snapshot.key;
  			data = snapshot.val();
  			commentsArr = snapshot.val().comments;			
		});
		console.log('The idea post data', data);
		console.log('The comment arr', commentsArr);
		var updates = {};
        // Condition for first comment and condition subsequent comments
        if (!commentsArr) {
        	var newComments = [ideaComment];
        	commentCount = newComments.length;
        	updates['/idea/' + uid + '/' + '/comments/'] = newComments;
        	updates['/idea/' + uid + '/' + '/commentCount/'] = commentCount;
        }
        else {
            commentsArr.push(ideaComment);
        	commentCount = commentsArr.length;
        	updates['/idea/' + uid + '/' + '/comments/'] = commentsArr;
        	updates['/idea/' + uid + '/' + '/commentCount/'] = commentCount;
        }               
        // Update likes and likeCount property in database
  		firebase.database().ref().update(updates); 
		res.json(data);
	}
})

/*
 *  Go to feed page 
*/
app.get('/feed', function (req, res) {
   	res.redirect('/');
})

/*
 *  Log out current user from feed
*/
app.get('/logout', function (req, res) {
	req.session.destroy (function () {
		console.log ('user logged out.');
	})
	res.render('welcome');
});

/*
 * Log current user out from profile page
*/
app.get('/user/logout', function (req, res) {	
	res.redirect('/logout');
});

/*
 *  Like each idea posted
*/ 
app.get('/likes', function (req, res) {
	if (req.session.user) {
		var id = parseInt(req.query.id);
		var email = req.session.user.email;
		var uid;
		var data;
		var likesArr;
		var likeCount;
		console.log('The id for like', id);
		console.log(typeof id);
		// locate idea with id.
		userIdeaRef.orderByChild("_id").equalTo(id).on("child_added", function (snapshot) {
  			console.log(snapshot.key);
  			uid = snapshot.key;
  			data = snapshot.val();
  			likesArr = snapshot.val().likes; 			
		});       
        console.log(uid);
        var updates = {};
        // Condition for first like and condition subsequent likes
        if (!likesArr) {
        	var newLikes = [email];
        	likeCount = newLikes.length;
        	updates['/idea/' + uid + '/' + '/likes/'] = newLikes;
        	updates['/idea/' + uid + '/' + '/likeCount/'] = likeCount;
        }
        else {
        	likeCount = likesArr.length;
        	var Arr = oneLikePerUser(email, likesArr);
        	updates['/idea/' + uid + '/' + '/likes/'] = Arr;
        	updates['/idea/' + uid + '/' + '/likeCount/'] = likeCount;
        }               
        // Update likes and likeCount property in database
  		firebase.database().ref().update(updates);     
        //console.log(data);
  		res.json(data);
	}
})

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