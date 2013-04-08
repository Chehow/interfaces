var Circle = function(_options){
	/*public fields*/
	
	/*private fields*/
	var self = this;
	var fabricObject = null;
	var id = null;
	var type = "circle";

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
		var circle = new fabric.Circle({
			radius: options.radius,
			left: options.left,
			top: options.top,
			stroke:$$('border_obj').getValue()?"#9eff4a":0,
			strokeWidth:$$('border_weight').getValue(),
			fill: $$('fill_obj').getValue()?$$('color').getValue():false,
			opacity: $$('opacity').getValue()
		});
		circle.id = currentTimeStamp.toString();
		circle.hasRotatingPoint = options.hasRotatingPoint;
		circle.border = $$('border_weight').getValue();
		canvas.add(self,circle);
		history.addNewHistoryItem('Add', circle);
	    fabricObject = circle;
	}
	
	coustruct();
}
