var ImagesTree = function(_options){
	
	/* fields*/
	this.darg_in_canvas_item = false;
	
	/*private fields*/
	var self = this;
	var treedata = null;
	var loadDialog = null;
	var webixTreeConfig = null;
	var wtree = null;
	var image_pic;
	var image_svg;
	var image_uploader = false;
	
	var defaults = {
		img_path: 'assets/img/',
		svg_path:'assets/svg/'
	};
	
	var options = $.extend(defaults,_options);

	/*public methods*/
	this.show = function(){
		history_window.show();
	}
	
	this.getTreeConfig = function(){
		return webixTreeConfig;
	}
	
	/*private methods*/
	function coustruct(){
		treedata = [
		    {id:"root", value:"Images", open:true, data:[
				{ id:"system", open:true, value:"System", data:[
					{ id:"buttons", value:"Buttons", open:true, data:[
						{ id:"danger_button.jpg", value:"Danger Button" },
						{ id:"prev_button.jpg", value:"Prev button" },
						{ id:"next_button.jpg", value:"Next Button" },
						{ id:"blue_button.jpg", value:"Blue Button" },
					]},
					{ id:"tabbars", value:"Tabbars", open:true, data:[
						{ id:"blue_tabbar.jpg", value:"Tabbar Blue" },
					]}
				]},
				{ id:"svg", open:true, value:"SVG", data:[
					{ id:"19_svg", value:"Svg 1" },
					{ id:"27_svg", value:"Svg 2" },
					{ id:"3_svg", value:"Svg 3" }
				]},
				{ id:"castom_svg", open:false, value:"Castom SVG", data:[
				]},
				{ id:"castom", open:true, value:"Castom Images", data:[
					{ id:"image_1", value:"My Image 1" },
					{ id:"image_2", value:"My Image 2" }
				]}
				
			]}
		];
		createTree();
	};
	
	function createTree(){
		webixTreeConfig = {
			view:"tree",
			name:"images_tree",
			id:"images_tree",
			select:true,
			//type:"lineTree",
			scroll: "y",
			drag:true,
			select:'multiselect',
			on:{
				onAfterRender: function(){
					wtree = $$("images_tree");
					afterRender();
				}
			},
			data: treedata
		};
	}
	
	function loadDialogHide(){
		loadDialog.hide();
	}

	function setMenu(){
		var image_tree_menu = webix.ui({
			view:"contextmenu",
			id:"image_tree_menu",
			name:"image_tree_menu",
			data:["Add Image","Remove Image"]
		});
		
		$$("image_tree_menu").attachEvent("onItemClick", function(id){
			 var menu = this.getSubMenu(id);
			 var context = this.getContext();
			 var treeId = context.id;
			 switch(menu.item(id).value){
		    	case "Add Image":
		    		image_uploader.show();
		    		break;
		    	case "Remove Image":
		    		var tree = context.obj;
					webix.confirm({
						type:"confirm-warning",
						text:"Remove "+tree.item(treeId).value+ " ?" ,
						callback:function(del){
							if(del){
								tree.remove(treeId);
								webix.message("Item "+tree.item(treeId).value+" removed!");
							}
						}
					});		    		
		    		break;
			 }
		});
		
		image_tree_menu.attachTo(wtree);		
	}
	
	function createImageUploader(){
		image_uploader = webix.ui({
			view:"popup",
		    position:"center",
		    modal: true,
		    width:500,
		    heigth:300,
			body: {
				view:"form", rows: [
					{ 
						view: "uploader",
						id:"images_uploader",
						name:"images_uploader",
						autosend:false,
						value: 'Add Images',
						link:"mylist",  
						upload:"/upload",
						on:{
							onBeforeFileAdd:function(item){
								var type = item.type.toLowerCase();
								if (type != "jpg" && type != "png" && type != "svg"){
									webix.message("Only PNG , JPG or SVG images are supported");
									return false;
								}								
							},
							
							onBindRequest : function(){
								 webix.message("onBindRequest");
							},
							
							onFileUpload : function(){
								webix.message("onFileUpload");
							},
							
							onFileUploadError:function(obj){
								webix.message("File "+obj.name+" uploaded!");
								if(obj.name.split('.')[1]=='svg'){
									wtree.add( {value:obj.name.split('.')[0] ,id:obj.name.split('.')[0]+'_svg'}, 0 , "castom_svg");
									webix.message("File saved in 'Castom SVG' folder");
								}else{
									wtree.add( {value:obj.name.split('.')[0] ,id:obj.name}, 0 , "castom");
									webix.message("File saved in 'Castom Image' folder");				
								}
								image_uploader.hide();
							},
						}
					},
					{
					 	view:"list",
					 	id:"mylist",
					 	type:"uploader",
						autoheight:true,
						borderless:true
					},
					{
						cols:[
							{ view: "button", label: "Save files", type:"iconButton", icon: "upload", click: function() {
								$$("images_uploader").attachEvent("onUploadComplete", function(){
									webix.message("done");
								});
								$$("images_uploader").send();
							}},
							{ view: "button", label: "Cancel", click: function() {
								image_uploader.hide();
							}}						
						]	
					},
				]
			}
		});
	}
	
	function afterRender(){
		setMenu();
		createImageUploader();
		wtree.attachEvent("onBeforeDrag", function(context, native_event){
			self.darg_in_canvas_item = context.start;
			return true;
		});
	
		wtree.attachEvent("onMouseOut", function(e){
			if(image_pic){
				image_pic.destructor();
			}
			if(image_svg){
				image_svg.destructor();
			}
		});

		wtree.attachEvent("onAfterDrop", function(context, native_event){
		   
		});

		wtree.attachEvent("onAfterSelect", function(id){
			if(wtree.parentId(id)=='svg' || wtree.parentId(wtree.parentId(id))=='svg'){
				canvas.setMode("svg");
			}else{
				canvas.setMode("image");
			}
		    return true;
		});

		wtree.attachEvent("onMouseMove", function(id, e, node){
			if($$('images_tree').parentId(id)=='svg' || $$('images_tree').parentId($$('images_tree').parentId(id))=='svg' || $$('images_tree').parentId(id)=='castom_svg'){
				$("#image_svg object").attr({ data: options.svg_path+id.split('_')[0]+'.svg'});
				if(image_svg){
					image_svg.destructor();
				}
				if(image_pic){
					image_pic.destructor();
				}
				image_svg = webix.ui({
					view:"popup",
				    width:150,
				    height:150,
				    left:e.pageX,
				    top:e.pageY,
				    padding: 2,
					body: {template:"html->image_svg"}
				});
				image_svg.show();			
			}else{
				$("#image_pic img").load(function(){
				    var width  = $('#image_pic').width();
				    var height = $('#image_pic').height();
					if(image_pic){
						image_pic.destructor();
					}
					if(image_svg){
						image_svg.destructor();
					}				
					image_pic = webix.ui({
						view:"popup",
					    head:"Autors",
					    width:width,
					    height:height,
					    left:e.pageX,
					    top:e.pageY,
					    padding: 2,
						body: {template:"html->image_pic"}
					});
					image_pic.show();
				});
				$("#image_pic img").attr({src: options.img_path+id});			
			}
		});
		
	}
	
	coustruct();
}
