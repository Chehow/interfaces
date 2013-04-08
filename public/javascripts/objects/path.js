var Path = function(_options){
	/*public fields*/
	
	/*private fields*/
	var self = this;
	var fabricObject = null;
	var id = null;
	var type = "path";

	var defaults = {
	};
	
	var options = $.extend(defaults,_options);

	/*public methods*/
	this.getFubricObject = function(){
		return fabricObject;
	}

	this.getId = function(){
		return id;
	}

	this.getType = function(){
		return type;
	}
		
	/*private methods*/
	function coustruct(){
		if(!options.server){
			var currentTimeStamp = (new Date()).getTime();
			fabricObject = options.fabric_object;
			fabricObject.id = currentTimeStamp.toString();
			id = currentTimeStamp.toString();
			canvas.add(self,fabricObject);
		}else{
			createObjectFromServer();
		}

	}
	
	function createObjectFromServer(){
		id = options.id;
		fabricObject = options.obj;
		history.addNewHistoryItem('Add', options.obj, true);
		canvas.add(self, fabricObject);		
	}	
	
	coustruct();
}
