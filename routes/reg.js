exports.reg = function(req, res){
	var user = new User(req.body.user);
	user.save(function(e){
    	res.redirect('/');
  	});	
};