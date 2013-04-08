var MainWindow = function(_options){
	/*public fields*/
	this.text_edit_window = null;
	this.draw = $("#draw_area");
	
	/*private fields*/
	var self = this;
	var ctrl = false;
	var full_screen = false
	var defaults = {
		user: "Customer"
	};
	
	var options = $.extend(defaults,_options);
	var user = options.user;
	
	
	/*public methods*/
	
	this.getUser = function(){
		return user;
	}

	this.showAutorInfo = function(){
		webix.ui({
			view:"popup",
			modal: true,
			height:220,
		    width:300,
		    position:"center",
		    head:"Autors",
			body:{
				template:"html->autors_info"
			}
		}).show();
	}
	
	/*private methods*/
	function coustruct(){
		if (!webix.env.touch && webix.ui.scrollSize){
			webix.CustomScroll.init(); 
		}
		setActions();
		createInterface();
		createTextEditWindow();
	};
	
	function createTextEditWindow(){
		self.text_edit_window = $("#text_window").webix_window({
			height:450,
		    width:300,
		    left:50, top:50,
			move:true,
		    head:"Input text:",
			body:{
				view:"textarea",
				id:"text_input_window",
				height:150,
				name:"text_input_window",
				label:"",
				value: "",
				placeholder: "Enter the text..."
			}
	    });
	    
		$$("text_input_window").attachEvent("onKeyPress", function(){
			var activeObject = canvas.fabricCanvas.getActiveObject();
			if(activeObject){
				if (!$$("text_input_window").getValue()){
					canvas.fabricCanvas.discardActiveObject();
				}else{
					activeObject.setText($$("text_input_window").getValue());
				}
				canvas.fabricCanvas.renderAll();
			}
		});	
	}
	
	
	function setActions(){
		$(document).keydown(function(event){
		    if (event.keyCode == 17) {
		        ctrl = true;
		    }
		    if (event.keyCode == 65 && ctrl) {
		        canvas.selectAllObjects();
		    }
		    if (event.keyCode == 90 && ctrl) {
				if(history.getCurrent()<30){
					var hist_arr = history.getJSONhistoryArray();
					canvas.fabricCanvas.clear();
					canvas.fabricCanvas.loadFromDatalessJSON(hist_arr[hist_arr.length-2-history.getCurrent()]);
					history.getBack();
				}
		    }
		});
		
		$(document).keyup(function(event){
		    if (event.keyCode == 46) {
		        canvas.removeSelected();
		    }
		    if (event.keyCode == 17) {
		        ctrl = false;
		    }
		    
		    if(event.keyCode == 27) {
		        if(!full_screen){
		        	setFullScreen();
		        }else{
		        	setSimpleScreen();
		        }
		    }
		});
		
		self.draw.scroll(function(){
			canvas.fabricCanvas.calcOffset();
		});
		
		$("html").mouseup(function(e){
			tree.darg_in_canvas_item = false;
		});
		
		$("#draw_area").mouseup(function(e){
			if(tree.darg_in_canvas_item){
				if(tree.darg_in_canvas_item.split('_')[1]=='svg'){
					var svg_name = tree.darg_in_canvas_item.split('_')[0];
					new Svg({
						left:e.pageX-$("#draw_area").offset().left,
						top:e.pageY-$("#draw_area").offset().top,
						name:svg_name
					});			
				}else{
					var image_name = tree.darg_in_canvas_item;
					new Img({
						left:e.pageX-$("#draw_area").offset().left,
						top:e.pageY-$("#draw_area").offset().top,
						name:image_name
					});					
				}
				canvas.setMode("select");
			}			
		})
	}
	
	function setFullScreen(){
		full_screen = true;
		$$('add_left_part').hide();
		$$('right_chat_panel').hide();
		$$('footer').hide();
		$$('main_menu').hide();
		canvas.fabricCanvas.calcOffset();
		canvas.fabricCanvas.renderAll();		
	}

	function setSimpleScreen(){
		full_screen = false;
		$$('add_left_part').show();
		$$('right_chat_panel').show();
		$$('footer').show();
		$$('main_menu').show();
		canvas.fabricCanvas.calcOffset()
		canvas.fabricCanvas.renderAll();
	}
	
	function mainMenuClick(id){
		var menu = $$('main_menu').getSubMenu(id);
		switch(menu.item(id).value){
			case "Full screen":
				setFullScreen();
				break
			case "Help!":
				window.open('http://docs.webixui.com');
				break;	
			case "Set Canvas Properties":
				canvas.changeProperties();
				break;									
			case "Change Background":
				canvas.changeBg();
				break;
			case "Autors":
				main_window.showAutorInfo();
				break;
			case "Rasterize to image":
				canvas.rasterizeToImage();
				break;
			case "See revision history":
				history.show();
				break;
			case "Lock horizontal movement" : 
			    var activeObject = canvas.fabricCanvas.getActiveObject();
			    if (activeObject) {
			    	activeObject.lockMovementX = !activeObject.lockMovementX;
			    }
				break;
			case "Lock vertival movement" :
				var activeObject = canvas.fabricCanvas.getActiveObject();
				if (activeObject) {
					activeObject.lockMovementY = !activeObject.lockMovementY;
				}
				break;
			case "Lock scaling" :
				var activeObject = canvas.fabricCanvas.getActiveObject();
				if (activeObject) {
					activeObject.lockScalingX = !activeObject.lockScalingX;
					activeObject.lockScalingY = !activeObject.lockScalingY;
				}									 
				break;
			case "Lock rotation" : 
				var activeObject = canvas.fabricCanvas.getActiveObject();
				if (activeObject) {
					activeObject.lockRotation = !activeObject.lockRotation;
				}									
				break;
			case "Gradientify" : 
				var obj = canvas.fabricCanvas.getActiveObject();
				if (obj) {
					obj.setGradient('fill', {
						x1: 0,
						y1: 0,
						x2: (getRandomInt(0, 1) ? 0 : obj.width),
						y2: (getRandomInt(0, 1) ? 0 : obj.height),
						colorStops: {
							0: '#' + getRandomColor(),
							1: '#' + getRandomColor()
						}
					});
					canvas.fabricCanvas.renderAll();
				}
				break;																			
			case "Clear" : 
				canvas.clearCanvas();
				break;
			default: webix.message("Click: "+menu.item(id).value);
		}
	}

	function createInterface(){
		webix.ui({
	        view:"layout",
	        width:"100%",
	        height:"100%",
	        id:"main_layout",
	        containter:"main_container",
	        type:"line",
	        rows:[
		             {
		 				view:"menu",
		 				id: "main_menu",
						data:[					
				            { value:"File", submenu:["New","Open", "Close", "Save as...", "Print", "See revision history", "Rasterize to image"]},
				            { value:"Language", submenu:[ "English","Russian"]},
				            { value:"Edit", submenu:[ "Undo", "Rendo","Cut","Copy","Paste","Clear","Lock horizontal movement", "Lock vertival movement", "Lock scaling", "Lock rotation", "Gradientify"]},				            
				            { value:"View", submenu:["Set Canvas Properties", "Full screen", "Compact controls","Change Background"]},			         
				            { value:"Help", submenu:[ "Info", "Autors", "Help!" ]},
						],
												        						
						on:{
							onItemClick:function(id){
								mainMenuClick(id);
							}
						}
	                },
	                {
						view:"toolbar",
						id:"topMainToolar",
						paddingY:10,
						paddingX:10,
						height:50,
					    cols:[
								{ width:100, borderless:true, rows:[
										{borderless:false, height:-1, cols:[
											{ view:"button", value:"Back", type:"prev", click: function(){
												if(history.getCurrent()<30){
													var hist_arr = history.getJSONhistoryArray();
													canvas.fabricCanvas.clear();
													canvas.fabricCanvas.loadFromDatalessJSON(hist_arr[hist_arr.length-2-history.getCurrent()]);
													history.getBack();
												}
											}},	
											{width:5},
											{ view:"button", value:"Next", type:"next", click: function(){
												if(history.getCurrent()>0){
													var hist_arr = history.getJSONhistoryArray();
													canvas.fabricCanvas.clear();
													history.getNext();
													canvas.fabricCanvas.loadFromDatalessJSON(hist_arr[hist_arr.length-1-history.getCurrent()]);
												}
												
											}},
										]},
								        { view:"button", height:-1, type:"danger", value:"X", click: function(){
								        	canvas.clearCanvas();
										}},									
									]
								},
								{
									view:"toggle",
									width:100,
								 	type:"iconButton",
								 	name:"draw_select", 
								 	id:"draw_select", 
		            				offIcon:"play", 
		            				onIcon:"pause",
		            				offLabel:"Draw",
		            				onLabel:"Select",
									    on:{
									        'onItemClick': function(id){
												canvas.fabricCanvas.isDrawingMode = !canvas.fabricCanvas.isDrawingMode;							        
									        }
									    }
		            			},
		            			
		            			{ view:"counter", label:"Line Height:", labelPosition:"top", step: 1 , value: 1, max:10,  width:95, name:"lineheight", id:"lineheight"},
		            			
								{ view:"colorpicker", label:"Color:", labelPosition:"top", name:"color", id:"color", value:"#8ca7ff", width:100},
								
								{ view:"richselect", label:"Font Family:", labelPosition:"top", value:"Arial", width:105, name:"font_family",id:"font_family", options:[
						                { value:"Arial", id:"Arial" },
						                { value:"Helvetica", id:"Helvetica" },
						                { value:"Myriad Pro", id:"Myriad Pro" },
						                { value:"Delicious", id:"Delicious" },
						                { value:"Verdana", id:"Verdana" },
						                { value:"Georgia", id:"Georgia" },
					                ], 
					     			labelAlign:'top' 
								},
								
								{ view:"richselect", label:"Font position:", labelPosition:"top", value:"Left", width:100, name:"font_position", id:"font_position", options:[
					                { value:"Left", id:"Left" },
					                { value:"Center", id:"Center" },
					                { value:"Right", id:"Right" },
					                ], 
					     			labelAlign:'top' 
								},
								
								{ view:"counter", label:"Opacity:", labelPosition:"top",  step: 0.1, value: 1, max:1, width:95, name:"opacity", id:"opacity"},
								
								{ borderless:true, width:45,  rows:[
									{ view:"button", css:"bold-button", id:"bold_text", value:"B", align:"left", height:-1, click: function() {
										var activeObject = canvas.fabricCanvas.getActiveObject();
										if (activeObject && activeObject.type === 'text') {
											activeObject.fontWeight = (activeObject.fontWeight == 'bold' ? '' : 'bold');
											this.className = activeObject.fontWeight ? 'selected' : '';
											canvas.fabricCanvas.renderAll();
										}		    
									}},
									
									{ view:"button", css:"italic-button", id:"itelic_text", value:"It",align:"left", height:-1, click: function() { 
										var activeObject = canvas.fabricCanvas.getActiveObject();
										if (activeObject && activeObject.type === 'text') {
											activeObject.fontStyle = (activeObject.fontStyle == 'italic' ? '' : 'italic');
											this.className = activeObject.fontStyle ? 'selected' : '';
											canvas.fabricCanvas.renderAll();
										}							    
									}}
								]},
								
								{ borderless:true, width:45,  rows:[
									{ view:"button", css:"underline-button", id:"underline_text", value:"U", width:45, align:"left", height:-1, click: function() {
										var activeObject = canvas.fabricCanvas.getActiveObject();
										if (activeObject && activeObject.type === 'text') {
											activeObject.textDecoration = (activeObject.textDecoration == 'underline' ? '' : 'underline');
											this.className = activeObject.textDecoration ? 'selected' : '';
											canvas.fabricCanvas.renderAll();
										}				      
									}},	
									{ view:"button", css:"linethrough-button", id:"linethrough_text", value:"Li", width:45, align:"left", height:-1, click: function() {
										var activeObject = canvas.fabricCanvas.getActiveObject();
										if (activeObject && activeObject.type === 'text'){
											activeObject.textDecoration = (activeObject.textDecoration == 'line-through' ? '' : 'line-through');
											this.className = activeObject.textDecoration ? 'selected' : '';
											canvas.fabricCanvas.renderAll();
										}						      
									}}																
								]},	

								{ borderless:true, width:45,  rows:[
									{ view:"button", css:"overline-button", id:"wverline_text", value:"O", width:45, align:"left", height:-1, click: function() {
										var activeObject = canvas.fabricCanvas.getActiveObject();
										if (activeObject && activeObject.type === 'text') {
											activeObject.textDecoration = (activeObject.textDecoration == 'overline' ? '' : 'overline');
											this.className = activeObject.textDecoration ? 'selected' : '';
											canvas.fabricCanvas.renderAll();
										}						      
									}},
									{ view:"button", css:"shadow-button", id:"shadow_button", value:"S", width:45, align:"left", height:-1, click: function() {
										var activeObject = canvas.fabricCanvas.getActiveObject();
										if (activeObject && activeObject.type === 'text') {
											activeObject.textShadow = !activeObject.textShadow ? 'rgba(0,0,0,0.2) 2px 2px 10px' : '';
											this.className = activeObject.textShadow ? 'selected' : '';
											canvas.fabricCanvas.renderAll();
										}							      
									}}																		
								]}
					    	]
	                },
	                {
	                	view:"accordion",
	                	multi:true,              		
	                	cols:[
		                	{
		                		
		                		body:{
									multi:true,
									id: "add_left_part",
									view:"accordion",
									width:200,
									rows:[
										{ header:"Fugures", headerAlt:"Fugures (Closed)",  body:{
												view:"toolbar",
											    id:"left_toolbar",
											   	scroll:"y",
											    rows:[
											    	
											    	/*
											    	{
											    		cols:[
													   		{ view:"checkbox", id:"border_obj", label:"Border:", value:1, width:100},
													   		{ view:"checkbox", id:"fill_obj2", label:"Fill:", value:1}										    		
											    		]
											    	},
											    	*/													
											   		{ view:"checkbox", id:"border_obj", label:"Border:", value:0},
											   		{ view:"checkbox", id:"fill_obj", label:"Fill:", value:1},
											   		{ view:"counter", label:"Border Weight:", labelPosition:"top",  step: 1, value: 1, max:10, name:"border_weight", id:"border_weight"},			    		
											        { view:"button", value:"Add Text",   click: function() {
											        	$$("draw_select").setValue(0);
											        	canvas.fabricCanvas.isDrawingMode = false;
													    canvas.setMode("text");
													}},
											        { view:"button", id:"LoadBut", value:"Rectangle",  click: function() {
											        	$$("draw_select").setValue(0);
											        	canvas.fabricCanvas.isDrawingMode = false;
											        	canvas.setMode("rectangle");
											        }},
											        { view:"button", value:"Cirle",  click: function() {
											        	$$("draw_select").setValue(0);
											        	canvas.fabricCanvas.isDrawingMode = false;
											        	canvas.setMode("circle");
											        }},
											        { view:"button", value:"Trinagle",  click: function() {
											        	$$("draw_select").setValue(0);
											        	canvas.fabricCanvas.isDrawingMode = false;

											        	canvas.setMode("triangle");
											        }},
											        { view:"button", value:"Ellipse",  click: function() {
											        	$$("draw_select").setValue(0);
											        	canvas.fabricCanvas.isDrawingMode = false;
											        	canvas.setMode("ellipse");
											        }},					        										        
											        { view:"button", value:"Line",  click: function() {
											        	$$("draw_select").setValue(0);
											        	canvas.fabricCanvas.isDrawingMode = false;
											        	canvas.setMode("line");
											        }}
											   ]											
											}
										},
										{
											header:"Images",
											//scroll:"y",
											headerAlt:"Images (Closed)",
											body:tree.getTreeConfig()
										}
									]		                			
		                		}
			
		                	},
		                	{
		                		
						        view:"template",
						        content:"draw_area",
						       	//css:"draw_area_box",
						       	//scroll:'xy',
		                	},
		                	{
		                		header:"Users Chat",
		                		id:"right_chat_panel",
		                		body:chat.getConfig()
		          
		                	}               	
	                	]
	           	
	                },
                {
			        view:"template",
			        content:"footer",
			        id:"footer",
			       	css:"footer",
			        height:40,	                 	
                }
	        ]
        });
        
		$('#message').keypress(function(e) {
			var text = $$('message').getValue();
			if (e.which == '13' && text!="") {
				chat.sendMessage(text);
			}
		});

        $$("send").attachEvent("onItemClick", function (){
        	var text = $$('message').getValue();
        	if(text!=""){
				chat.sendMessage(text);
        	}
        });
        
	    $$("list_input").attachEvent("onTimedKeyPress",function(){
	        var value = this.getValue().toLowerCase();
	        $$("chat_list").filter(function(obj){
	            return (obj.html.toLowerCase().indexOf(value)+1);
	        })
	    });
        
		$$("color").attachEvent("onChange", function(newv, oldv){
			if(canvas.fabricCanvas.isDrawingMode){
				canvas.fabricCanvas.freeDrawingColor = newv; 
			}else{
				var activeObject = canvas.fabricCanvas.getActiveObject(),
				activeGroup = canvas.fabricCanvas.getActiveGroup();
				if(activeObject){
					activeObject.fill = newv;
				}else if (activeGroup) {
		     	 	var objectsInGroup = activeGroup.getObjects();
		      		objectsInGroup.forEach(function(object) {
		        		object.fill = newv;
		      		});
	    		}
				canvas.fabricCanvas.renderAll();				
			}
     	});
  
		$$("opacity").attachEvent("onChange", function(newv, oldv){
			var activeObject = canvas.fabricCanvas.getActiveObject(),
			activeGroup = canvas.fabricCanvas.getActiveGroup();
			if(activeObject){
				activeObject.opacity = newv;
			}else if (activeGroup) {
	     	 	var objectsInGroup = activeGroup.getObjects();
	      		objectsInGroup.forEach(function(object) {
	        		object.opacity = newv;
	      		});
    		}
			canvas.fabricCanvas.renderAll();
     	});
     	   	
     	$$("font_family").attachEvent("onChange", function(newv, oldv){
			var activeObject = canvas.fabricCanvas.getActiveObject();
			if (activeObject && activeObject.type === 'text'){
				activeObject.fontFamily = newv;
				canvas.fabricCanvas.renderAll();
			}      		
     	});

     	$$("border_weight").attachEvent("onChange", function(newv, oldv){
			var activeObject = canvas.fabricCanvas.getActiveObject();
			if (activeObject){
				activeObject.border = $$('border_weight').getValue();
				activeObject.set('strokeWidth',newv);
				canvas.fabricCanvas.renderAll();
			}      		
     	});

     	$$("border_obj").attachEvent("onChange", function(newv, oldv){
			var activeObject = canvas.fabricCanvas.getActiveObject();
			if (activeObject){
				activeObject.set('stroke',newv?'red':0);
				canvas.fabricCanvas.renderAll();
			}      		
     	});

     	$$("fill_obj").attachEvent("onChange", function(newv, oldv){
			var activeObject = canvas.fabricCanvas.getActiveObject();
			if (activeObject){
				activeObject.set('fill',newv?'red':0);
				canvas.fabricCanvas.renderAll();
			}      		
     	});

     	$$("font_position").attachEvent("onChange", function(newv, oldv){
			var activeObject = canvas.fabricCanvas.getActiveObject();
			if (activeObject && activeObject.type === 'text'){
				var value = newv.toLowerCase();
				activeObject.textAlign = value;
				canvas.fabricCanvas.renderAll();
			}      		
     	});

	}
	
	coustruct();
}
