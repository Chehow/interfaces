var Text = function(_options){
	/*public fields*/
	
	/*private fields*/
	var self = this;
	var fabricObject = null;
	var id = null;
	var type = "text";
	
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

	this.onObjectSelected = function(e){
		var selectedObject = fabricObject;
		if (selectedObject.type === 'text'){
			$$('text_input_window').setValue(selectedObject.getText());
			main_window.text_edit_window.show();
			main_window.text_edit_window.setPosition(selectedObject.left+220-main_window.draw.scrollLeft(),selectedObject.top+100-main_window.draw.scrollTop());
		}
	}

	this.onObjectClearSelection = function(e){
		text_edit_window.hide();
	}

	
	this.onObjectMove = function(e){
		var selectedObject = e.target;
		if (selectedObject.type === 'text'){
			log(selectedObject.left);
			main_window.text_edit_window.setPosition(selectedObject.left+220-main_window.draw.scrollLeft(),selectedObject.top+100-main_window.draw.scrollTop());
		}
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
		var value = $$('font_position').getValue().toLowerCase();
		var currentTimeStamp = (new Date()).getTime();
		id = currentTimeStamp;
		var text = new fabric.Text(options.text,{
			left: options.left,
			top: options.top,
			fontFamily: $$('font_family').getValue(),
			angle:0,
			textAlign:value,
			fill: 'black',
			scaleX: 0.5,
			scaleY: 0.5,
			fontWeight: '',
			originX: 'left',
			hasRotatingPoint: true
	    });
	    
	    text.id = currentTimeStamp.toString();
	    text.hasRotatingPoint = options.hasRotatingPoint;
	    fabricObject = text;
		canvas.add(self,text);
		history.addNewHistoryItem('Add', text);
	}
	
	coustruct();
}
