var Triangle = function(_options){
	/*public fields*/
	
	/*private fields*/
	var self = this;
	var fabricObject = null;
	var id = null;
	var type = "trinagle";

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
		var obj = new fabric.Triangle({
			width: options.width,
			height: options.height,
			left: options.left,
			top: options.top,
			stroke:$$('border_obj').getValue()?"red":0,
			strokeWidth:$$('border_weight').getValue(),
			fill: $$('fill_obj').getValue()?$$('color').getValue():false,
		    opacity: $$('opacity').getValue(),
		});
	
		obj.id = currentTimeStamp.toString();
		obj.hasRotatingPoint = options.hasRotatingPoint;
		obj.border = $$('border_weight').getValue();
		canvas.add(self,obj);
		history.addNewHistoryItem('Add', obj);
		fabricObject = obj;
	}
	
	coustruct();
}
