exports.list = function(req, res){
	var users = User.find().all(function(users){
		switch (req.params.format){
			 case 'json':
				res.send(users.map(function(u) {
					return u.__doc;
				}));
			 default: 
			 	res.render('index.html');
		}
	});
};

exports.reg = function(req, res, next){
	var user = new User(req.body.user);
	user.save(function(e){
    	res.redirect('/room/'+user._id);
  	});	
};

exports.login = function(req, res, next){
	if(req.session){
		console.log(req.session);
	}
	
	var data = req.body.user;
	User.find({$or:[{"username" : data.email.toLowerCase()}, {"email" : data.email.toLowerCase()}], "pass":data.pass}, function (err, users) {
		if(users.length == 1){
			req.session.user_id = users[0]._id;
			res.redirect('/room');
		}else{
			res.send({ 'login': 0 });
		}
		
	});
};
