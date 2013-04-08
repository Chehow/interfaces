var Connector = function(_options){
	/* fields*/
	this.socket = null;
	this.url = null;
	/*private fields*/
	var self = this;
	var defaults = {
	};
	
	var options = $.extend(defaults,_options);

	/*private methods*/
	function coustruct(){
		var url = options.url;
		var id = Math.round($.now()*Math.random());
		self.url = url;
		if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
			self.socket = io.connect(url, {'transports': ['xhr-polling']});
		} else {
			self.socket = io.connect(url);
		}
		self.socket.on('connect', function () {
			self.socket.on('message', function (msg) {		
				//if(chat){
				//	chat.addMessage(msg);
				//}
			});
			
			
			self.socket.on('sendcanvas', function (data){
				canvas.fabricCanvas.clear();
				canvas.fabricCanvas.loadFromDatalessJSON(data);
			});	
			
			self.socket.on('rectadding', function (data){
				var rect = new fabric.Rect(data);
				canvas.fabricCanvas.add(rect);
			});
		
			self.socket.on('refreshCanvas', function (data){
				canvas.fabricCanvas.clear();
				canvas.fabricCanvas.loadFromDatalessJSON(data);
			});	
		});

		
		self.socket.on('addObject', function (msg) {
			canvas.addObjectFromServer(msg.id, msg.object);
		});

		self.socket.on('moveObject', function (data) {
			canvas.moveObjectFromServer(data.id, data.x, data.y);
		});

		self.socket.on('scaleObject', function (data) {
			canvas.scaleObjectFromServer(data.id, data.scaleX, data.scaleY);
			canvas.moveObjectFromServer(data.id, data.x, data.y);
		});

		self.socket.on('rotateObject', function (data) {
			canvas.rotateObjectFromServer(data.id, data.angle);
		});
		
		self.socket.on('removeObject', function(data){
			canvas.removeObjectFromServer(data.id);
		});
		
		self.socket.on('news', function (data) {
		   console.log(data);
		});
	};
	
	coustruct();
}

	/*
	// This demo depends on the canvas element

	if(!('getContext' in document.createElement('canvas'))){
		alert('Sorry, it looks like your browser does not support canvas!');
		return false;
	}
	
	// The URL of your web server (the port is set in app.js)
	var url = 'http://localhost:8080';

	var doc = $(document),
		win = $(window),
		canvas = $('#paper'),
		ctx = canvas[0].getContext('2d'),
		instructions = $('#instructions');
	
	// Generate an unique ID
	var id = Math.round($.now()*Math.random());
	
	// A flag for drawing activity
	var drawing = false;

	var clients = {};
	var cursors = {};
	var socket;
	
	if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1) {
		socket = io.connect('http://192.168.1.40:8080', {'transports': ['xhr-polling']});
	} else {
		socket = io.connect('http://192.168.1.40:8080');
	}

	socket.on('connect', function () {
		socket.on('message', function (msg) {
			document.querySelector('#log').innerHTML += strings[msg.event].replace(/\[([a-z]+)\]/g, '<span class="$1">').replace(/\[\/[a-z]+\]/g, '</span>').replace(/\%time\%/, msg.time).replace(/\%name\%/, msg.name).replace(/\%text\%/, unescape(msg.text).replace('<', '&lt;').replace('>', '&gt;')) + '<br>';
			document.querySelector('#log').scrollTop = document.querySelector('#log').scrollHeight;
		});

		$('#message').keypress(function(e) {
			if (e.which == '13' && $$('message').getValue()!="") {
				socket.send(escape($$('message').getValue()));
				$$('message').blur();
				$$('message').focus();
				$$('message').setValue("");
			}
		});

        $$("send").attachEvent("onItemClick", function (){
        	if($$('message').getValue()!=""){
	 			socket.send(escape($$('message').getValue()));
				$$('message').focus();
	        	$$('message').setValue("");       		
        	}
        });
	});
	
	
	socket.on('moving', function (data){		
		if(! (data.id in clients)){
			// a new user has come online. create a cursor for them
			cursors[data.id] = $('<div class="cursor">').appendTo('#cursors');
		}
		
		// Move the mouse pointer
		cursors[data.id].css({
			'left' : data.x,
			'top' : data.y
		});
		
		// Is the user drawing?
		if(data.drawing && clients[data.id]){
			
			// Draw a line on the canvas. clients[data.id] holds
			// the previous position of this user's mouse pointer
			
			drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
		}
		
		// Saving the current client state
		clients[data.id] = data;
		clients[data.id].updated = $.now();
	});

	var prev = {};
	
	
	canvas.on('mousedown',function(e){
		e.preventDefault();
		drawing = true;
	
		prev.x = e.pageX;
		prev.y = e.pageY;
		
		// Hide the instructions
		instructions.fadeOut();
	});
	
	doc.bind('mouseup mouseleave',function(){
		drawing = false;
	});

	var lastEmit = $.now();

	doc.on('mousemove',function(e){
		if((e.pageX-$("#draw_area").offset().left) >=0 && (e.pageY-$("#draw_area").offset().top)>=0){
			$("#x_coord").html(e.pageX-$("#draw_area").offset().left);
			$("#y_coord").html(e.pageY-$("#draw_area").offset().top);			
		}else{
			$("#x_coord").html(0);
			$("#y_coord").html(0);			
		}

		if($.now() - lastEmit > 30){
			socket.emit('mousemove',{
				'x': e.pageX,
				'y': e.pageY,
				'drawing': drawing,
				'id': id
			});
			lastEmit = $.now();
		}
		
		// Draw a line for the current user's movement, as it is
		// not received in the socket.on('moving') event above
		
		if(drawing){
			drawLine(prev.x, prev.y, e.pageX, e.pageY);
			
			prev.x = e.pageX;
			prev.y = e.pageY;
		}
	});

	// Remove inactive clients after 10 seconds of inactivity
	setInterval(function(){
		
		for(ident in clients){
			if($.now() - clients[ident].updated > 10000){
				
				// Last update was more than 10 seconds ago. 
				// This user has probably closed the page
				
				cursors[ident].remove();
				delete clients[ident];
				delete cursors[ident];
			}
		}
		
	},10000);

	function drawLine(fromx, fromy, tox, toy){
		ctx.moveTo(fromx-$("#draw_area").offset().left, fromy-$("#draw_area").offset().top);
		ctx.lineTo(tox-$("#draw_area").offset().left, toy-$("#draw_area").offset().top);
		ctx.stroke();
	}
	*/