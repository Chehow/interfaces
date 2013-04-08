var History = function(_options){
	/* fields*/
	
	/*private fields*/
	var self = this;
	var current_step = 0;
	var history = Array();
	var history_count = 0;
	var history_window = null;
	var history_grid = null;

	var defaults = {
		history_length: 30
	};
	
	var options = $.extend(defaults,_options);

	/*public methods*/

	this.getJSONhistoryArray = function(){
		return history;
	}
	
	this.getCurrent = function(){
		return current_step;
	}

	this.getBack = function(){
		current_step++;
	}

	this.getNext = function(){
		current_step--;
	}

	this.addNewHistoryItem = function(action, obj, nosend){
		var history_grid = $$('history_grid');
		var curdate = new Date();
		webix.message(action+": "+obj.type);

		if(history.length > options.history_length-1){
			history.shift();
		}
		
		history.push(canvas.fabricCanvas.toJSON());
		
		if(!nosend){
			connector.socket.emit(action,{type:obj.type, id:obj.id, object:obj.toJSON()});
		}
				
		history_grid.add({
			time:moment().format('LLL'),
			user:main_window.getUser(),
			type:action,
			object:obj.type,
			num:history_count++
		});
		
		history_grid.refresh();
	}
	
	this.show = function(){
		history_window.show();
	}
	
	/*private methods*/
	function coustruct(){
		createHistWindow();
	};
	
	function createHistWindow(){
		history_window = $("#history_window").webix_window({
			view:"window",
			move:true,
			width: 430,
			height: 600,
		    left:202,
		    top:107,
		    maxHeight: 600,
		    //scroll: 'y',
		    id:"history_window",
		    name:"history_window",
		    //animate:{type:"flip", subtype:"vertical"},
		    head:{
				view:"toolbar", cols:[
					{view:"label", label: "History" },
					{ view:"button", type:"danger", label: 'X', width: 40, inputHeight: 30, align: 'right', click:hide}
				]
			},
			  
			body:{
				
				view:"datatable",
				name:"history_grid",
				id:"history_grid",
				//scroll: 'y',
				columns:[
					{ id:"num",	header:"#", width:50,	sort:"int"},
					{ id:"type", header:"Action",width:100,	sort:"string"},
					{ id:"object", header:"Object",width:100,	sort:"string"},
					{ id:"user", header:"User" , width:80,	sort:"string"},
					{ id:"time", header:"Time", 	width:100,	sort:"date"}
				],
				select:"row",
				//autoheight:true,
				//autowidth:true,
			}
	    });	
	    history_grid = $$('history_grid');
	}
	
	function hide(){
		history_window.hide();
	}
	
	coustruct();
}
