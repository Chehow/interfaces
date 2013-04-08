var Svg = function(_options){
	/*public fields*/
	
	/*private fields*/
	var self = this;
	var fabricObject = null;
	var id = null;
	var type = "svg";

	var defaults = {
		path:"assets/svg/",
		cornerColor: '',
		hasRotatingPoint: true
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
		fabric.loadSVGFromURL(options.path+options.name+'.svg', function(objects, ops) {
			var loadedObject = fabric.util.groupSVGElements(objects, ops);
			loadedObject.set({
				left: options.left,
				top: options.top,
				angle: 0,
				padding: 10,
				cornersize: 10,
			});
			loadedObject.id = currentTimeStamp;
			fabricObject = loadedObject;
			loadedObject.setCoords();
			loadedObject.hasRotatingPoint = options.hasRotatingPoint;
			history.addNewHistoryItem('Add', loadedObject);
			canvas.add(self,loadedObject);
		});
	}
	
	coustruct();
}
