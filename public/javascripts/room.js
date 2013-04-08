
var user;
$.post("/user/", {}, function(req){
	user  = req.user;
	$(function(){
				webix.ui({
				container:"main",
				id:"layout",
				minWidth: 1024,
				minHeight: 768,
				scroll:'xy',
				rows:[
					{
						height:80,
						
						cols:[
							{
								width:241,
								template:"<p class='header_files'>Files</p>",
								css:'drive',
							},								
							{view:"toolbar", padding:25, height:50, cols: [						
									{view:"search", align:"center", placeholder:"Search...", id:"search", width: 300, inputHeigth:30, height:30},
								]
							},
							{
								template:"<div class='pupil_info'><p class='pupil_name'>#firstname# #lastname#</p><div class='pupil_image'><img src='#photo#'/></div><div>",
								width:300,
								data:user,
								css:'drive',
							}
						]					
					},
					{cols:[
						{
							width:220,
							height:'100%',
							padding:10,
							
							margin:10,
							rows:[
								{
									view:"button",
									id:"create",
									value:"Create",
									type:"danger",
									click: function(){
										createNewProject();
									}
								},
								{
					                view:"menu",
									layout:"y",
									subMenuPos:"right",
									data:[
										{ value:"My Files"},
										{ value:"Shared with me"},
										{ value:"Starres"},
										{ value:"Recent"},
										{ $template:"Separator" },
										{ value:"Info" }
									],
									on:{
										onItemClick:function(id){
											var menu = this.getSubMenu(id);
											webix.message("Click: "+menu.item(id).value);
										}
									}								
								}
							]
						},
						{
							view:"resizer",
							id:"resizer"
						},
						{	
							columns:[
								{ id:"ch", header:[{text:"Title", colspan:2}] , template:"{common.checkbox()}", width:40, css:"static_table_cols"},
								{ id:"title", fillspace:true, minWidth: 200, sort:"string", template:"#title#", editor:"text", css:"static_table_cols"},							
								{ id:"owner", header:"Owner", width:200, sort:"string"},
								{ id:"lastmod",	header:"Last Modified", width:200, sort:"date"},
								{ id:"users", header:"Users", width:400},
							],
							minWidth: 1000,
							scroll:"xy",
							leftSplit:2,
							editaction:"dblclick",
							editable:true,
							id:"projects",
							select:true,
							//data: data,
							checkboxRefresh:false,
							url:"projects/",
							view:"datatable",
							scroll:false
							//autowidth:true,
						}
					]
					}
				]
			}).show();
			

			var members = webix.ui({
	            view:"window",
	            move:true,
	            modal:true,
	            id:"edit_users",
	            head:"Users editing",
	            position:"center",
	            body:{
	                rows:[
	                {
	                    view:"tabbar",  value: 'show', id:'edit_user_tabbar', multiview:true, options: [                                            
	                                    { value: 'Users Show',  id: 'show'},
	                                    { value: 'Users Add',  id: 'add'}
	                                ]
	                },
                    {
                    cells:[
                    {
                        width:800,
                        height:600,
                        view:"datatable",
                        id:'show',
                        scroll:0,
                        columns:[             
                            { id:"email",	header:"Email", width:370, sort:"string"},
                            { id:"username",	header:"Nick", width:370, sort:"string"},
                            { id:"delete",	header:"", 	width:40, template: function (obj) {
                                if(obj['del'] === 'true') {return "<div><img src='images/delete.png'></div>";} else {return '';}}
                            }
                        ],
                        select:"row",
                        editable:false,
                    }, 
	                {
	                    id:'add',
	                    rows:[
				            {
				                height: 35,
				                view:"toolbar",
				                elements:[
				                    {view:"text", id:"list_input",label:"Find User:",css:"fltr", labelWidth:100}
				                ]
				            },	                    	
	                        {
	                            width:1120,
	                            view:"datatable",
	                            id:"table_members",
	                            scroll:0,
	                            columns:[             
	                                { id:"name",	header:"First Name", width:160, sort:"string"},
	                                { id:"lastname",	header:"Last Name", width:160, sort:"string"},
	                                { id:"country",	header:"Country", width:160, sort:"string"},
	                                { id:"email",	header:"Email", width:160, sort:"string"},
	                                { id:"photo",	header:"Photo", width:160, sort:"string"},
	                                { id:"username",	header:"Nick", width:160, sort:"string"},
	                                { id:"male",	header:"Male", width:160, sort:"string"}
	                                /*           
	                                { id:"delete",	header:"", 	width:36, template: function (obj) {
	                                    if(obj['del'] === 'true') {return "<div><img src='images/delete.png'></div>";} else {return '';}}
	                                }
	                                */
	                            ],
	                            select:"row",
	                            editable:false,
	                           
	                        },                        
	                        {
	                            view:"form",	
	                            id:"buttons",
	                            elements:[   
	                                { cols:[                  
	                                    { id: "but_save_project", view:"button", value:"Add Selected", type:"form"},                        
	                                    { width:270}
	                                ]}
	                            ]
	                        }
	                    ]                    
	                }                       
                        ]
                    },               

	                ]
	            }
	        }).hide();
	        
			$$("projects").attachEvent("onBeforeEditStart", function(id){
				if(id.column=='users'){
					$$('edit_users').show();
				}
			});		
						
			var project_menu =  webix.ui({
				view:"contextmenu",
				id:"project_menu",
				name:"project_menu",
				data:["Rename", "Open", "Delete", "Remove Checked","New"]
			});
			
			$$("search").attachEvent("onTimedKeyPress",function(){
				var value = this.getValue().toLowerCase(); 
				$$("projects").filter(function(obj){ //here it filters data!
					return obj.title.toLowerCase().indexOf(value)==0;
				})
			});
			
			project_menu.attachEvent("onBeforeShow", function(){
				var context = this.getContext();
				$$("projects").select(context.id.row);
				return true;
			});
			
			project_menu.attachEvent("onItemClick", function(id){
				var menu = this.getSubMenu(id);
				var context = this.getContext();
				var treeId = context.id;
				switch(menu.item(id).value){
		    	case "Open":
		    	 	window.open("index.html?file="+context.id);
		    		//window.location = "index.html?file="+context.id;
		    		break;
		    	case "New":
		    		createNewProject();
		    		break;
		    	case "Delete":
			    	var sid =$$("projects").getSelectedId();
			    	var nrow = $$("projects").indexById(sid);
					$.post("/projects/delete", {proj:sid},function(res){
			    	 	$$("projects").remove(sid);
			    	 	$$("projects").select($$("projects").idByIndex(nrow));							
					},"json");
		    		break;
		    	case "Remove Checked":
					$$("projects").eachRow( 
					    function (row){
					  		var orow = $$("projects").item(row);
					  		if(orow.ch){
					  			$$("projects").remove(row);
					  		}
					    }
					)		    	 	
		    		break;	    		
		    	case "Rename":
		    	 	$$("projects").editCell(context.id.row, 'title');  		
		    		break;
				}			
			});
			
			project_menu.attachTo($$("projects"));
			
			$$("projects").attachEvent("onXLE", function(){
			    //console.log($$("projects").serialize());
			});
			
			$$("projects").attachEvent("onAfterSelect", function(data, prevent){
			    //console.log(data);
			});

			$$("projects").attachEvent("onAfterEditStop", function(obj,node){
				if(obj.value!=obj.old){
					$.post("/projects/change", {proj:node.row,title:obj.value});
				}
			});
	});
},'json');

function createNewProject(){
	$.post("/projects/add", {},function(res){
		$$('projects').add(res);		
	},"json");
	
}
