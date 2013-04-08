var CanvasObject = function(_options){
	/*public fields*/
	
	/*private fields*/
	var self = this;
	var fabricObject = null;
	var id = null;

	var defaults = {};
	
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
	
	this.onObjectSelected = function(e){
		log(e);
	}

	this.onObjectMoving = function(e){
		var obj = e.target;
		connector.socket.emit("Move",{id:obj.id, x:obj.getLeft(),y:obj.getTop()});
	}

	this.onObjectRotating = function(e){
		var obj = e.target;
		connector.socket.emit("Rotate",{id:obj.id, angle:obj.getAngle()});
	}

	this.onObjectModified = function(e){
		history.addNewHistoryItem('Modified',e.target);
	}

	this.onObjectClearSelection = function(){
		main_window.text_edit_window.hide();
	}

	this.onObjectScaling = function(e){
		var obj = e.target;
		connector.socket.emit("Scale",{id:obj.id, scaleX:obj.getScaleX(),scaleY:obj.getScaleY(), x:obj.getLeft(),y:obj.getTop()});
    	/*
    	var selectedObject = e.target; 
		selectedObject.width = selectedObject.width+(selectedObject.scaleX*selectedObject.width)/100;
		selectedObject.height = selectedObject.height+selectedObject.scaleY;
		selectedObject.scaleX = 1;
    	selectedObject.scaleY = 1;
        obj.strokeWidth = obj.border / obj.scaleX;
        var activeObject = self.fabricCanvas.getActiveObject();
        activeObject.set('strokeWidth',obj.strokeWidth);
        */		
	}

	function bringToFront(){
		var selectedObject = canvas.fabricCanvas.getActiveObject();
		canvas.fabricCanvas.bringToFront(selectedObject);
		canvas.fabricCanvas.renderAll();
		history.addNewHistoryItem('Bring To Front', selectedObject);
	}
	
	function bringForward(){
		var selectedObject = canvas.fabricCanvas.getActiveObject();
		canvas.fabricCanvas.sendBackwards(selectedObject);
		canvas.fabricCanvas.renderAll();
		history.addNewHistoryItem('Bring Forward', selectedObject);
	}
	
	/*private methods*/
	function coustruct(){
		id = options.id;
	};
	
	coustruct();
}

var staticObject = new CanvasObject({});
