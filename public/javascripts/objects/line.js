var Line = function(_options){
	/*public fields*/
	
	/*private fields*/
	var self = this;
	var fabricObject = null;
	var id = null;
	var type = "line";
	
	this.dots = Array();

	var defaults = {
		cornerColor: 'red',
		hasRotatingPoint:true
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
		
		var line = new fabric.Line([ options.a, options.b, options.m, options.n], {
		    fill: $$('color').getValue(),
		    opacity: $$('opacity').getValue(),
		});
		
		line.id = currentTimeStamp.toString();
		line.hasRotatingPoint = options.hasRotatingPoint;
		canvas.add(self,line);
		history.addNewHistoryItem('Add', line);
		fabricObject = line;
	}
	
	coustruct();
}
