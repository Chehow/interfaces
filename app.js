
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var db = mongoose.connection;

var express = require('express')
  , routes = require('./routes')
  , users = require('./routes/user')
  , http = require('http')
  , html = require('html')
  , path = require('path');

mongoose.connect('mongodb://localhost/drawing');
var app = express();

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {});

var userSchema = mongoose.Schema({
    firstname: String,
    lastname: String,
    username: String,
    email: String,
    select_date_of_bd: String,
    pass: String,
    male:String,
    country:String,
    projs:Array
});

var projectSchema = mongoose.Schema({
    title: String,
    users: String,
    lastmod: String,
    creator: String,
    owner: String,
    id: String,
    ch: String,
    serialize: Object
});

var Project = mongoose.model('projects', projectSchema);

userSchema.virtual('id').get(function() {
	return this._id.toHexString();
});

var User = mongoose.model('membres', userSchema);

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.set('title', 'Designing the User Interface');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.cookieSession({key: 'some-key',
	secret: 'some-We1rD sEEEEEcret!'}));
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.favicon(__dirname + '/images/favicon.ico'));
	app.use(express.cookieParser());
	app.use(express.static(path.join(__dirname, 'public')));
	app.engine('html', require('ejs').renderFile);
})


function loadUser(req, res, next){
	if(req.session.user_id){
		User.find({ _id: req.session.user_id}, function (err, users) {
			if(users.length>=1){
				req.currentUser = users[0];
				next();			
			}else{
				res.redirect('/login');
			}
		});		
	}else{
		res.redirect('/login');
	}
}


if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/users.:format?', user.list);
/*
app.post('/users.:format?', function(req, res) {
  var user = new User(req.body['user']);
  user.save(function() {
    switch (req.params.format) {
      case 'json':
        res.send(user.__doc);
       break;
       default:
        res.redirect('/users');
    }
  });
});
*/

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', loadUser, function(req, res){
	var user = req.currentUser;
	
	res.render('room.html', {
		locals: {
		    title: 'User Room',
		    user: user
		}
	});
});

app.post('/user', loadUser, function(req, res){
	var user = req.currentUser;
	if(user){
		res.send({ 'user': user });
	}else{
		res.send({ 'user': 0 });
	}
});

app.get('/room', loadUser, function(req, res){
	var user = req.currentUser;
	res.render('room.html', {
		locals: {
		    title: 'User Room'
		}
	});
});

app.get('/room', loadUser, function(req, res){
	var user = req.currentUser;
	res.render('room.html', {
		locals: {
		    title: 'User Room'
		}
	});
});

app.get('/project/getusers/:id', function(req, res){
	var proj = req.params.id;
	User.find({ projs: proj}, function (err, users) {
		res.send(users);
	});
});

app.get('/getusers', function(req, res){
	var proj = req.params.id;
	User.find({}, function (err, users) {
		res.send(users);
	});
});

app.post('/projects/delete', loadUser, function(req, res){
	var user = req.currentUser;
	var proj = req.body.proj;
	
	for (var i=0; i < user.projs.length; i++){
		if (req.body.proj == user.projs[i]){
			user.projs.splice(i, 1);
			--i;
		}
	}	

	Project.remove({ _id: proj}, function (err) {
		user.save(function(){
			res.send({});
		});
	});	
});


app.get('/projects', loadUser, function(req, res){
	var user = req.currentUser;
	var data = Array();
	for (var i=0; i < user.projs.length; i++){
		(function(i){
			Project.find({ _id: user.projs[i]}, function (err, proj) {
			if(proj && proj[0]){
				proj[0].id=proj[0]._id;
				proj[0].ch=1;
				data.push(proj[0]);				
			}
			if(i==user.projs.length-1){
				res.send(data);
			}
		});
		})(i);
	};	
	
});

app.post('/projects/change', function(req, res){
	var proj = req.body.proj;
	var title = req.body.title;
	Project.update({_id:proj},{title:title}, function (err, proj){
		res.send({ 'update': 1 });
	});	
});

app.get('/login', function(req, res){
	res.render('login.html', {
		locals: {
		    title: 'Login'
		}
	});
});

app.post('/reg', function(req, res, next){
	var user = new User(req.body.user);
	user.save(function(e){
    	res.redirect('/room/'+user._id);
  	});	
});

app.post('/log', function(req, res, next){
	var data = req.body.user;
	User.find({$or:[{"username" : data.email.toLowerCase()}, {"email" : data.email.toLowerCase()}], "pass":data.pass}, function (err, users) {
		if(users.length == 1){
			req.session.user_id = users[0].id;
			res.send({ 'login': 1 });
		}else{
			res.send({ 'login': 0 });
		}
	});
});



app.get('/documents.:format', function(req, res) {
});

// Создать
app.post('/documents.:format?', function(req, res) {
});

// Прочитать
app.get('/documents/:id.:format?', function(req, res) {
});

// Изменить
app.put('/documents/:id.:format?', function(req, res) {
});

// Удалить
app.del('/documents/:id.:format?', function(req, res) {
});