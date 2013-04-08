var MainCanvas = function(_options){
	/*private fields*/
	var self = this;
	var objects_container = {};
	var mode = "select";
	var last_added_fabric = null;
	var change_background = null;
	var sel_ctx_menu = null;
	var draw_ctx_menu = null;
	var canvas_properties_dialog = null;
	
	var defaults = {
		bg: 'bg.png',
		image_path: 'assets/img/',
		width:1900,
		height:1000,
		free_drawing_cursor : 'crosshair',
		history_length: 30,
		user: "Customer"
	};
	var options = $.extend(defaults,_options);
	var bg = {
		type: "image",
		value: options.bg
	};
	
	/*public fields*/
	this.fabricCanvas = null;
	
	/*public methods*/
	this.add = function(item, fobj){
		self.fabricCanvas.add(fobj);
		self.fabricCanvas.calcOffset();
		objects_container[item.getId().toString()] = item;
		last_added_fabric = fobj;
	}
	
	this.setMode = function(newmode){
		mode = newmode;
	}

	this.getMode = function(){
		return mode;
	}

	this.selectAllObjects = function(){
		var allObjects = self.fabricCanvas.getObjects();
		for(var i=0,j=allObjects.length; i<j; i++){
		  allObjects[i].setActive(true);
		};
		webix.alert("All objects selected");
	}
		
	this.changeProperties = function(){
		canvas_properties_dialog.show();
	}
	
	this.removeSelected = function(){
		var activeObject = self.fabricCanvas.getActiveObject();
		var activeGroup = self.fabricCanvas.getActiveGroup();
		if(activeObject || activeGroup){
			webix.confirm({
				type:"confirm-warning",
				text:"Are you sure?",
				callback:function(del){
					if(del){
						if(activeObject){
							history.addNewHistoryItem('Remove', activeObject);
							self.fabricCanvas.remove(activeObject);
							connector.socket.emit("Remove",{id:activeObject.id});
						}else if (activeGroup) {
				     	 	var objectsInGroup = activeGroup.getObjects();
				      		self.fabricCanvas.discardActiveGroup();
				      		objectsInGroup.forEach(function(object) {
				      			history.addNewHistoryItem('Remove', object);
				        		self.fabricCanvas.remove(object);
				        		connector.socket.emit("Remove",{id:object.id});
				      		});
			    		}
			    						
					}
				}
				
			}); 		
		}		
	}
	
	this.changeBg = function(){
		change_background.show();
	}

	this.clearCanvas = function(){
		webix.confirm({
			type:"confirm-warning",
			text:"Are you sure?",
			callback:function(del){
				if(del){
					self.fabricCanvas.clear();
					history.addNewHistoryItem('Clear',{type:"Canvas", id:"canvas"})
				}
			}
		});
	}
	this.rasterizeToImage = function(){
		if (!fabric.Canvas.supports('toDataURL')) {
			webix.alert({
				type:"alert-error",
				text:'This browser doesn\'t provide means to serialize canvas to an image'
			});											
		}else{
			window.open(self.fabricCanvas.toDataURL('png'));
		}		
	}
	
	this.scaleObjectFromServer = function(id,scaleX,scaleY){
		self.fabricCanvas.calcOffset();
		objects_container[id].getFubricObject().set('scaleX',scaleX).setCoords();
		objects_container[id].getFubricObject().set('scaleY',scaleY).setCoords();
		objects_container[id].getFubricObject().setLeft(objects_container[id].getFubricObject().getLeft()).setCoords();
		objects_container[id].getFubricObject().setTop(objects_container[id].getFubricObject().getTop()).setCoords();		
		self.fabricCanvas.renderAll();
	}

	this.moveObjectFromServer = function(id,x,y){
		self.fabricCanvas.calcOffset();
		objects_container[id].getFubricObject().setLeft(x).setCoords();
		objects_container[id].getFubricObject().setTop(y).setCoords();
		self.fabricCanvas.renderAll();
	}

	this.rotateObjectFromServer = function(id,angle){
		self.fabricCanvas.calcOffset();
		objects_container[id].getFubricObject().setAngle(angle).setCoords();
		self.fabricCanvas.renderAll();
	}

	this.removeObjectFromServer = function(id){
		self.fabricCanvas.calcOffset();
		self.fabricCanvas.remove(objects_container[id].getFubricObject());
		self.fabricCanvas.renderAll();
	}

	this.addObjectFromServer = function(id,obj){
		var pathProp = obj.paths ? 'paths' : 'path';
		var path = obj[pathProp];
		if (typeof path !== 'string') {
		    if (obj.type === 'image' || obj.type === 'group') {
				fabric[fabric.util.string.capitalize(obj.type)].fromObject(obj, function (o) {
					o.id = id;
					new Img({
						server: true,
						obj: o,
						id:id
					});
					//self.fabricCanvas.add(o);
				});
		    }else{
		    	
		    	var klass = fabric[fabric.util.string.camelize(fabric.util.string.capitalize(obj.type))];
		    	if (!klass || !klass.fromObject) return;
		    	if (path) {
		    		obj[pathProp] = path;
		    	}
		    	var o = klass.fromObject(obj);
		    	o.id = id;
		    	switch(o.type){
		    		case "rect":
						new Rect({
							server: true,
							obj: o,
							id:id
						});		    		
		    			break;
		    		case "circle":
						new Circle({
							server: true,
							obj: o,
							id:id
						});		    		
		    			break;
		    		case "ellipse":
			    		new Ellipse({
							server: true,
							obj: o,
							id:id
						});
		    			break;
		    		case "line":
						new Line({
							server: true,
							obj: o,
							id:id
						});		    		
		    			break;
		    		case "triangle":
			    		new Triangle({
							server: true,
							obj: o,
							id:id
						});
		    		case "text":
			    		new Text({
							server: true,
							obj: o,
							id:id
						});						
					default:
			    		new Svg({
							server: true,
							obj: o,
							id:id
						});						
		    			break;
		    	}
		    }
		}else{
	    	if(obj.type === 'image') {
				fabric.util.loadImage(path, function (image) {
					var oImg = new fabric.Image(image);
					oImg.setSourcePath(path);
					fabric.util.object.extend(oImg, obj);
					oImg.setAngle(obj.angle);
					oImg.id = id;
					new Img({
						server: true,
						obj: oImg,
						id:id
					});
					self.fabricCanvas.add(oImg);
				});
	    	}else if(obj.type === 'text'){
				if (obj.useNative) {
					var o = fabric.Text.fromObject(obj);
					o.id = id;
					new Text({
						server: true,
						obj: o,
						id:id
					});
	  			}else{
				    obj.path = path;
				    var object = fabric.Text.fromObject(obj);
	    			/** @ignore */
					var onscriptload = function () {
		  				// TODO (chehow): find out why Opera refuses to work without this timeout
		  				if(Object.prototype.toString.call(fabric.window.opera) === '[object Opera]') {
							setTimeout(function () {
								object.id = id;
								new Text({
									server: true,
									obj: object,
									id:id
								});
			    			}, 500);
		  				}else{
		  					object.id = id;
							new Text({
								server: true,
								obj: object,
								id:id
							});
						}
					};
					fabric.util.getScript(path, onscriptload);
				} 
	    	}else{
	      		fabric.loadSVGFromURL(path, function (elements) {
		    		var object = fabric.util.groupSVGElements(elements, obj, path);
			        // copy parameters from serialied json to object (left, top, scaleX, scaleY, etc.)
			        // skip this step if an object is a PathGroup, since we already passed it options object before
		        	if (!(object instanceof fabric.PathGroup)) {
		          		fabric.util.object.extend(object, obj);
		          		if (typeof obj.angle !== 'undefined') {
		            		object.setAngle(obj.angle);
		          		}
		    		}
		        	object.id = id;
					new Path({
						server: true,
						obj: object,
						id:id
					});		 
	      		});
			}
		}		
	}
		
	/*private methods*/
	function coustruct(){
		var nativeCnv = document.getElementById("paper");
		self.fabricCanvas = new fabric.Canvas(nativeCnv);
		self.fabricCanvas.isDrawingMode = false;
		self.fabricCanvas.freeDrawingLineWidth = 1;
		self.fabricCanvas.freeDrawingCursor = options.free_drawing_cursor;
		self.fabricCanvas.setDimensions({width:options.width, height:options.height});
		self.fabricCanvas.setBackgroundImage(options.image_path+options.bg,function(){
			self.fabricCanvas.renderAll();
		});
		
		setCanvasEvents();
		createChangeBgWindow();
		setMenu();
		setChangePropsDialog();
	}
	
	function setChangePropsDialog(){
		canvas_properties_dialog = webix.ui({
			view:"window",
			move:false,
			modal:true,
		    position:"center",
		    id:"canvas_properties_dialog",
		    name:"canvas_properties_dialog",
		    width:400,
		    height:500,
		    head:{
				view:"toolbar", cols:[
					{view:"label", label: "Set Canvas" },
					{ view:"button", type:"danger", label: 'X', width: 40, inputHeight: 30, align: 'right', click:"$$('canvas_properties_dialog').hide();"}
				]
			},
			body:{
					view:"property",
					id:"sets",
				    elements:[
				        { label:"Layout" },
				        { label:"Width", type:"text", id:"width"},
				        { label:"Data loading" },
				        { label:"Data url", type:"text", id:"url"},
				        { label:"Data type", type:"select", options:["json","xml","csv"], id:"type"},
				        { label:"Use JSONP", type:"checkbox", id:"jsonp"},
				    ]         		
			}
		});	
	}
		
	function setMenu(){
		sel_ctx_menu = webix.ui({
			view:"contextmenu",
			id:"canvas_menu",
			name:"canvas_menu",
			data:[{value:"Add", submenu:[ "Text", "Rectangle", "Circle", "Tirnagle", "Ellipse","Line" ]},"Bring to front","Bring Forward", "Rename","Delete",{ $template:"Separator" },"Info"],
			master:"draw_area"
		});
		
		draw_ctx_menu =	webix.ui({
			view:"context",
			body:{
				/*Html form тут не работаетview:"htmlform",template: "html->tpl", id: "htmlform1",width: 500,height: 200*/
				view:"form",
				id:"draw_form",	
				rows:[
					{ view:"select", label:"Mode: ", value:'Pencil', id:"draw_mode", options:[
			                { id:"Pencil", value:"Pencil" },
			                { id:"Circle", value:"Circle" },
			                { id:"Spray", value:"Spray" },
			                { id:"Pattern", value:"Pattern" },
			                { id:"hline", value:"hline" },
			                { id:"vline", value:"vline" },
			                { id:"square", value:"square" },
			                { id:"diamond", value:"diamond" },
			                { id:"texture", value:"texture" }              
						],
					},
					{ view:"counter", label:"Line width:", id:"draw_width", step: 1, value:1},
					{ view:"colorpicker", label:"Line color:", name:"color_draw", id:"color_draw", value:"#8ca7ff"},
					{ view:"counter", label:"Line shadow width:", id:"draw_shadow_width", step: 10}
				]
			}, 
			width: 300, 
			master:"draw_area"
		});
				
		sel_ctx_menu.attachEvent("onItemClick",selectCanvasMenuItem);
   
		sel_ctx_menu.attachEvent("onBeforeShow", function(){
			return !self.fabricCanvas.isDrawingMode;
		});
		
		draw_ctx_menu.attachEvent("onBeforeShow", function(){
			return self.fabricCanvas.isDrawingMode;
		});

		$$('draw_mode').attachEvent("onChange",setBrushType);
		
	 	$$("color_draw").attachEvent("onChange", function(newv, oldv){ 
	 		self.fabricCanvas.freeDrawingBrush.color = newv;
	 		return true;
	 	});
	 	
	 	$$("draw_width").attachEvent("onChange", function(newv, oldv){   	
	 		self.fabricCanvas.freeDrawingLineWidth = parseInt(newv) || 1;
	 		self.fabricCanvas.freeDrawingBrush.width = parseInt(newv) || 1;
	 		return true;
	 	});
	 	
	 	$$("draw_shadow_width").attachEvent("onChange", function(newv, oldv){
	 		self.fabricCanvas.freeDrawingBrush.shadowBlur = parseInt(newv, 10) || 0;
	 		return true;	
	 	});
	}
	
	function bringObjectToFront(){
		var selectedObject = self.fabricCanvas.getActiveObject();
		self.fabricCanvas.bringToFront(selectedObject);
		self.fabricCanvas.renderAll();
		history.addNewHistoryItem('Bring To Front', selectedObject);
	}
	
	function bringObjectForward(){
		var selectedObject = self.fabricCanvas.getActiveObject();
		self.fabricCanvas.sendBackwards(selectedObject);
		self.fabricCanvas.renderAll();
		history.addNewHistoryItem('Bring Forward', selectedObject);
	}
	
	function selectCanvasMenuItem(id){
	    var menu = this.getSubMenu(id);
	   	var top = menu.config.top+main_window.draw.scrollTop();
	   	var left = menu.config.left+main_window.draw.scrollLeft();
	    switch(menu.item(id).value){
	    	case "Bring to front":
	    		bringObjectToFront();
	    		break;
	    	case "Bring to forward":
	    		bringObjectForward();
	    		break;	    		
	    	case "Delete":
	    		self.removeSelected();
	    		break;
	    	case "Text":
	    		var text_item = new Text({
	    			left: left-main_window.draw.offset().left+main_window.draw.scrollLeft(),
	    			top: top-main_window.draw.offset().top+main_window.draw.scrollTop(),
	    			text: "Simple text for example!\nSimple text for example!"
	    		});
	    		self.setMode("select");
	    		break;
	    	case "Rectangle":
	    		var rect = new Rect({
	    			left:left-main_window.draw.offset().left,
	    			top:top-main_window.draw.offset().top,
	    			height:100,
	    			width:100
	    		});
	    		self.setMode("select");
	    		break;
	    	case "Circle":
	    		var circle = new Circle({
	    			radius: 50,
	    			left:left-main_window.draw.offset().left,
	    			top:top-main_window.draw.offset().top
	    		});
	    		self.setMode("select");
	    		break;
	    	case "Tirnagle":
				var triangle = new Triangle({
	    			left:left-main_window.draw.offset().left,
	    			top:top-main_window.draw.offset().top,
	    			height:100,
	    			width:100
	    		});
	    		self.setMode("select");
	    		break;	    		
	    	case "Ellipse":
				var ellipse = new Ellipse({
	    			left:left-main_window.draw.offset().left,
	    			top:top-main_window.draw.offset().top,
	    			ry:50,
	    			rx:80
	    		});
	    		self.setMode("select");
	    		break;
	    	case "Line":
				var line = new Line({
					a:left-main_window.draw.offset().left,
					b:top-main_window.draw.offset().top,
					m:left-main_window.draw.offset().left,
					n:top-main_window.draw.offset().top
				});
				self.setMode("endline");
	    		break;
		}		
	}
	
	function setBrushType(value){
		switch(value){
			case 'hline': 
				self.fabricCanvas.freeDrawingBrush = vLinePatternBrush;
				break;
			case 'vline': 
				self.fabricCanvas.freeDrawingBrush = hLinePatternBrush;
				break;
			case 'square': 
				self.fabricCanvas.freeDrawingBrush = squarePatternBrush;
				break;
			case 'diamond': 
				self.fabricCanvas.freeDrawingBrush = diamondPatternBrush;
				break;
			case 'texture': 
				self.fabricCanvas.freeDrawingBrush = texturePatternBrush;
				break;
			default:
				self.fabricCanvas.freeDrawingBrush = new fabric[value + 'Brush'](self.fabricCanvas);
				break;
		}
	    if (self.fabricCanvas.freeDrawingBrush) {
	      self.fabricCanvas.freeDrawingColor = $$('color_draw').getValue();
	      self.fabricCanvas.freeDrawingBrush.color = $$('color_draw').getValue();
	      self.fabricCanvas.freeDrawingLineWidth = parseInt($$('draw_width').getValue()) || 1;
	      self.fabricCanvas.freeDrawingBrush.width = parseInt($$('draw_width').getValue()) || 1;
	      self.fabricCanvas.freeDrawingBrush.shadowBlur = parseInt($$('draw_shadow_width').getValue()) || 0;
	    }
	}
	
	function createChangeBgWindow(){
		change_background = webix.ui({
			view:"window",
			move:false,
		    position:"center",
		    id:"change_background",
		    name:"change_background",
		    width:400,
		    height:500,
		    head:{
				view:"toolbar", cols:[
					{view:"label", label: "Select Background" },
					{ view:"button", type:"danger", label: 'X', width: 40, inputHeight: 30, align: 'right', click:"$$('change_background').hide();"}
				]
			},
			body:{
	            rows:[
	            	{
	                   view:"segmented", id:'select_bg', selected: 'listView', multiview:true, optionWidth:80,  align:"center", padding: 5, options: [
	                        { value: 'Images', id: 'images_grid'},
	                        { value: 'Colors', id: 'color_bg'}
	                    ]
	                },
	                {height: 5},
	                {
	                    cells:[
	                        {
	                            id:"images_grid",
	                            view:"dataview",
					            data:bgs, 
						        type:{
									template:"<div style='background:url(assets/img/bgs/#src#) repeat; width:100%; height:100%;'></div>",
									width:"auto", 
									height:"auto"
								},
								xCount:3,
								yCount:3,
	                            select:true,
	                        },
	                        {
								view:"colorboard",
								id:"color_bg",
								cols:7,
								rows:9,
							}
	                    ]
	                },
	                {
	                	padding: 10,
	                	cols:[
	                    	{id:"save_bg", view:"button", value:"Save", type:"form", click:saveBg},
	                    	{id:"cancel_bg", view:"button", value:"Cancel", type:"danger", click:cancelBg}	                            	
	                	]
	                }
	        	]                   		
			}
		});
		
		$$("color_bg").attachEvent("onSelect", setCanvasBgColor);
		$$("images_grid").attachEvent("onSelectChange", setCanvasBgImage);
	}
	
	function saveBg(){
		if($$('select_bg').getValue() === "images_grid"){
    		bg.type = "image";
    		bg.value = self.fabricCanvas.backgroundImage;
    		history.addNewHistoryItem('Change Bg', {type:"canvas", id:"canvas"});
    		change_background.hide();	 	                    			
		}else{
    		bg.type = "color";
    		bg.value = self.fabricCanvas.backgroundColor;
    		history.addNewHistoryItem('Change Bg', {type:"canvas", id:"canvas"});
    		change_background.hide();	                    			
		}		
	}
	
	function cancelBg(){
		if(bg.type==="color"){
			self.fabricCanvas.backgroundColor = bg.value;
			self.fabricCanvas.renderAll();
		}else{
			self.fabricCanvas.setBackgroundImage(options.image_path+'bgs/'+bg.value,function(){
				self.fabricCanvas.renderAll();
			});
		}		
	}
	
	function setCanvasBgColor(color){
		self.fabricCanvas.setBackgroundImage('');
		self.fabricCanvas.backgroundColor = color;
		self.fabricCanvas.renderAll();
	}

	function setCanvasBgImage(id){
		self.fabricCanvas.setBackgroundImage(options.image_path+'bgs/'+$$('images_grid').item(id).src,function(){
			self.fabricCanvas.renderAll();
	    });
	}
	
	function setPatterns(){
	  if (fabric.PatternBrush) {
	    vLinePatternBrush = new fabric.PatternBrush(canvas.fabricCanvas);
	    vLinePatternBrush.getPatternSrc = function() {
	
	      var patternCanvas = fabric.document.createElement('canvas');
	      patternCanvas.width = patternCanvas.height = 10;
	      var ctx = patternCanvas.getContext('2d');
	
	      ctx.strokeStyle = this.color;
	      ctx.lineWidth = 5;
	      ctx.beginPath();
	      ctx.moveTo(0, 5);
	      ctx.lineTo(10, 5);
	      ctx.closePath();
	      ctx.stroke();
	
	      return patternCanvas;
	    };
	
	    hLinePatternBrush = new fabric.PatternBrush(canvas);
	    hLinePatternBrush.getPatternSrc = function() {
	
	      var patternCanvas = fabric.document.createElement('canvas');
	      patternCanvas.width = patternCanvas.height = 10;
	      var ctx = patternCanvas.getContext('2d');
	
	      ctx.strokeStyle = this.color;
	      ctx.lineWidth = 5;
	      ctx.beginPath();
	      ctx.moveTo(5, 0);
	      ctx.lineTo(5, 10);
	      ctx.closePath();
	      ctx.stroke();
	
	      return patternCanvas;
	    };
	
	    squarePatternBrush = new fabric.PatternBrush(canvas);
	    squarePatternBrush.getPatternSrc = function() {
	
	      var squareWidth = 10, squareDistance = 2;
	
	      var patternCanvas = fabric.document.createElement('canvas');
	      patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
	      var ctx = patternCanvas.getContext('2d');
	
	      ctx.fillStyle = this.color;
	      ctx.fillRect(0, 0, squareWidth, squareWidth);
	
	      return patternCanvas;
	    };
	
	    diamondPatternBrush = new fabric.PatternBrush(canvas);
	    diamondPatternBrush.getPatternSrc = function() {
	
	      var squareWidth = 10, squareDistance = 5;
	      var patternCanvas = fabric.document.createElement('canvas');
	      var rect = new fabric.Rect({
	        width: squareWidth,
	        height: squareWidth,
	        angle: 45,
	        fill: this.color
	      });
	
	      var canvasWidth = rect.getBoundingRectWidth();
	
	      patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
	      rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });
	
	      var ctx = patternCanvas.getContext('2d');
	      rect.render(ctx);
	
	      return patternCanvas;
	    };
	  }
	}

	function setCanvasEvents(){
		self.fabricCanvas.on('mouse:move', onMove);
		self.fabricCanvas.on('mouse:up', onMouseUp);
		self.fabricCanvas.on('mouse:down', onMouseDownE)
		self.fabricCanvas.on('path:created', onPathCreated);
		
		self.fabricCanvas.on('object:selected', function(obj){
			if(objects_container[obj.target.id].onObjectSelected){
				objects_container[obj.target.id].onObjectSelected();
			}
			if(staticObject.onObjectSelected){
				staticObject.onObjectSelected();
			}
		});
		
		self.fabricCanvas.on('object:moving', function(obj){
			if(objects_container[obj.target.id].onObjectMoving){
				objects_container[obj.target.id].onObjectMoving(obj);
			}
			if(staticObject.onObjectMoving){
				staticObject.onObjectMoving(obj);
			}
		});
		
		self.fabricCanvas.on('object:rotating', function(obj){
			if(objects_container[obj.target.id].onObjectRotating){
				objects_container[obj.target.id].onObjectRotating(obj);
			}
			if(staticObject.onObjectRotating){
				staticObject.onObjectRotating(obj);
			}
		});
		
		self.fabricCanvas.on('object:modified', function(obj){
			if(objects_container[obj.target.id].onObjectModified){
				objects_container[obj.target.id].onObjectModified(obj);
			}
			if(staticObject.onObjectModified){
				staticObject.onObjectModified(obj);
			}
		});
		
		self.fabricCanvas.on('selection:cleared', function(){
			if(staticObject.onObjectClearSelection){
				staticObject.onObjectClearSelection();
			}
			
		});
		
		self.fabricCanvas.on('object:moving', function(obj){
			if(objects_container[obj.target.id].onObjectMove){
				objects_container[obj.target.id].onObjectMove(obj);
			}
			if(staticObject.onObjectMove){
				staticObject.onObjectMove(obj);
			}
		});

		self.fabricCanvas.on('object:scaling', function(obj){
			if(objects_container[obj.target.id].onObjectScaling){
				objects_container[obj.target.id].onObjectScaling(obj);
			}
			if(staticObject.onObjectScaling){
				staticObject.onObjectScaling(obj);
			}
		});
	}
	
	function onPathCreated(e){
		var path = new Path({fabric_object:e.path});
		if(self.fabricCanvas.isDrawingMode){
			history.addNewHistoryItem('Add', e.path);
		}
	}
	
	function onMouseUp(native_evt){
		
	}
	
	function onMove(native_evt){
		if((native_evt.e.pageX-main_window.draw.offset().left) >=0 && (native_evt.e.pageY-main_window.draw.offset().top)>=0){
			$("#x_coord").html(native_evt.e.pageX-main_window.draw.offset().left);
			$("#y_coord").html(native_evt.e.pageY-main_window.draw.offset().top);			
		}
		if(mode=='endline' && last_added_fabric.type=='line'){
			last_added_fabric.set('x2',native_evt.e.pageX-main_window.draw.offset().left);
			last_added_fabric.set('y2',native_evt.e.pageY-main_window.draw.offset().top);
			self.fabricCanvas.renderAll();
			last_added_fabric.setCoords();
		}		
	}

  	function onMouseDownE(evt){
  		var leftpos = evt.e.pageX-main_window.draw.offset().left+main_window.draw.scrollLeft();
  		var toppos = evt.e.pageY-main_window.draw.offset().top+main_window.draw.scrollTop();
		switch (self.getMode()){
			case "draw" : break;
			case "text" :
	    		var text_item = new Text({
	    			left: leftpos,
	    			top: toppos,
	    			text: "Simple text for example!\nSimple text for example!"
	    		});
	    		self.setMode("select");
			break;
			case "rectangle" :
				var rect = new Rect({
	    			left:leftpos,
	    			top:toppos,
	    			height:100,
	    			width:100
	    		});
	    		self.setMode("select");
				break;
			case "triangle" :
				var triangle = new Triangle({
	    			left:leftpos,
	    			top:toppos,
	    			height:100,
	    			width:100
	    		});
	    		self.setMode("select");
				break;
			case "circle":
				var circle = new Circle({
	    			radius: 50,
	    			left:leftpos,
	    			top:toppos
	    		});
	    		self.setMode("select");
				break;
			case "ellipse" :
				var ellipse = new Ellipse({
	    			left:leftpos,
	    			top:toppos,
	    			ry:50,
	    			rx:80
	    		});
	    		self.setMode("select");
			 	break;
			case "image":
				var image_name = $$('images_tree').getSelected();
				var img = new Img({
					left:leftpos,
					top:toppos,
					name:image_name
				});	
				self.setMode("select");
			case "svg":
				var svg_name = $$('images_tree').getSelected().split('_')[0];
				var svg = new Svg({
					left:leftpos,
					top:toppos,
					name:svg_name
				});
				self.setMode("select");
				break;
			case "endline" :
				history.addNewHistoryItem('Add', last_added_fabric);
				self.setMode("select");
				break;
			case "line" :
				var line = new Line({
					a:leftpos,
					b:toppos,
					m:leftpos,
					n:toppos
				});
				self.setMode("endline");
				break;
			default: break;
		}
	}
	

	function sendJSON(e){
		connector.socket.emit('changes',self.fabricCanvas.toJSON());
	}
	
	coustruct();
}
