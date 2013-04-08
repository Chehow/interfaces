var Img = function(_options){
	/*public fields*/
	
	/*private fields*/
	var self = this;
	var fabricObject = null;
	var id = null;
	var type = "image";

	var defaults = {
		path:"assets/svg/",
		cornerColor: '',
		hasRotatingPoint: true,
		pass: 'assets/img/'
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
			createFabricItem();
		}else{
			createObjectFromServer();
		}
	};
	
	function createObjectFromServer(){
		id = options.id;
		fabricObject = options.obj;
		history.addNewHistoryItem('Add', options.obj, true);
		canvas.add(self, fabricObject);		
	}
	
	function createFabricItem(){
		var currentTimeStamp = (new Date()).getTime();
		id = currentTimeStamp;
		fabric.Image.fromURL(options.pass+options.name, function(image) {
			image.set({
			  left: options.left,
			  top: options.top,
			  angle: 0,
			  padding: 0,
			  cornersize: 10
			});
			image.id = currentTimeStamp;
			image.hasRotatingPoint = options.hasRotatingPoint;
			fabricObject = image;
			history.addNewHistoryItem('Add', image);
			canvas.add(self, fabricObject);
		});
	}
	
	coustruct();
}
