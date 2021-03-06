
$(function(){	
	var login_form = webix.ui({
		view:"window",
		modal: true,
		height:420,
	    width:600,
	    position:"center",
	    head:"Sign in",
		body:{
			view:"form",
			scroll:false,
			id:"login_form",
			width:300,
			padding:35,
			elements:[
					{ view:"text", label:"Username or Email:", labelPosition:"top", name:"email", id:"email", placeholder:"you email"},
					{ view:"text", type:'password', label:"Password <a href='#' >(forgot password)</a>", labelPosition:"top", name:"pass", id:"pass", placeholder:"you password"},
					{ margin:5, cols:[
						{ view:"button", label:"Login" , type:"form", click:function(){
							if(this.getParent().getParent().validate()){
								var vals = $$("login_form").getValues();				
								$.post("/log/", { user: vals}, function(req){
									if(req.login){
										window.location = '/room';
									}else{
										webix.alert("Not correct user or pass!");
									}
								},'json');	
							}else{
								webix.message("Not correct data!");
							}
						}},
						{ view:"button", label:"Cancel" }
					]},
					{ view:"button", label:"Create new account" , type: 'form', click:function(){
						login_form.hide();
						reg_form.show();
					}}
			],
			rules:{
				$all:webix.rules.isNotEmpty,
				//"email":webix.rules.isEmail
			}
		}
	});
	login_form.show();

	var reg_form = webix.ui({
		view:"window",
		modal: true,
		height:820,
	    width:600,
	    position:"center",
	    head:"Create your free personal account",
		body:{
			view:"form",
			scroll:false,
			id:"reg_form",
			width:300,
			padding:35,
			elements:[
					{ view:"text", label:"First Name:", name:"firstname", id:"firstname", placeholder:"you name"},
					{ view:"text", label:"Last Name:", name:"lastname", id:"lastname", placeholder:"you lastname"},
					{ view:"text", label:"Username:", name:"username", id:"username", placeholder:"you nick"},
					{ view:"text", label:"Email:", name:"email", id:"email", placeholder:"you email"},
					{ view:"datepicker", name: "select_date_of_bd", label: 'Birthday:'},
					{ view:"text", type:'password', label:"Password:", labelWidth:120,  name:"pass", id:"pass", placeholder:"you password"},
					{ view:"text", type:'password', label:"Confirm Password:", labelWidth:120,  name:"passconf", id:"passconf", placeholder:"you password confirm"},
					{ view:"segmented", value:"male", name:"male", id:"male", label:"Sex:", options:[
						{ id:"male", value:"Male" },
						{ id:"female", value:"Female"},
					]},
					{ 
						view:"combo", width:300,
						label: 'Country:',  name:"country", id:"country",
						value:1, yCount:"3", options:[ 
							{ id:1, value:"Belarus"},
							{ id:2, value:"Russia"}, 
							{ id:3, value:"USA"}
						]
					},
					
					{view:"button", label:"Create new account" , type: 'form', click:function(){
						if(this.getParent().validate()){
							$.post("/reg/", { user: $$("reg_form").getValues()}, function(){
								webix.alert("You account created!");
							},'json');						
						}
					}}
			],
			rules:{
				$all:webix.rules.isNotEmpty,
				"email":webix.rules.isEmail,
				$obj:function(data){
					if (!data.pass){
						webix.message("You need to specify password");
						return false;
					}
					if (data.pass != data.passconf){
						webix.message("Passwords are not the same"); 
						return false;
					}
					return true;
				}
			}
		}
	});
});