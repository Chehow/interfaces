var Chat = function(_options){
	/* fields*/
	
	/*private fields*/
	var self = this;
	var config;

	var defaults = {
	};
	
	var options = $.extend(defaults,_options);

	/*public methods*/
	this.getConfig = function(){
		return config;
	}

	this.addMessage = function(msg){
		var text = strings[msg.event].replace(/\[([a-z]+)\]/g, '<span class="$1">').replace(/\[\/[a-z]+\]/g, '</span>').replace(/\%time\%/, msg.time).replace(/\%name\%/, msg.name).replace(/\%text\%/, unescape(msg.text).replace('<', '&lt;').replace('>', '&gt;')) + '<br>';
		$$("chat_list").add({
			html:text
		});
		$$("chat_list").scrollTo(0, 5000);
	}
	
	this.sendMessage = function(text){
		connector.socket.send(escape(text));
		$$('message').blur();
		$$('message').focus();
		$$('message').setValue("");		
	}
	/*private methods*/
	function coustruct(){
		createChatConfig();
	};
	
	function createChatConfig(){
		config = {
			width:300,
    		rows:[
        		{
			        rows:[
			            {
			                height: 35,
			                view:"toolbar",
			                elements:[
			                    {view:"text", id:"list_input",label:"Find message:",css:"fltr", labelWidth:100}
			                ]
			            },
			            {
			                view:"list",
			                id:"chat_list",
							type:{
				                height: 60,
				                template:"#html#",
			            	},			            
			                select:true,
			            }
			        ]    			
        		},
        		{
				    view:"form", 
				    id:"send_form",
				    elements:[
				        { view:"text", label:"", name:"message" , id:"message"},
				        { margin:5, cols:[
				             { view:"button", value:"Send" , type:"form", name:"send", id:"send", click: function() {}},
				        ]},
				   ]	                			
        		}
    		]	
		}
	}
	
	coustruct();
}