var clients = {};
var cursors = {};
var main_window = null;
var history = null;
var canvas = null;
var tree = null;
var connector = null;

$(function(){
   	connector = new Connector({
  		url:'http://192.168.1.40:8080',
  		id: Math.round($.now()*Math.random()),
  	});
  	
 	tree = new ImagesTree();
	chat = new Chat();
	history = new History();
  	main_window = new MainWindow();
  	canvas = new MainCanvas({});	
});