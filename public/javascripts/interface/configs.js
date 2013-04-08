var strings = {
	'connected': '[sys][time]%time%[/time]: You have successfully connected to the server as [user]%name%[/user].[/sys]',
	'userJoined': '[sys][time]%time%[/time]: User [user]%name%[/user] joined the chat.[/sys]',
	'messageSent': '[out][time]%time%[/time]: [user]%name%[/user]: %text%[/out]',
	'messageReceived': '[in][time]%time%[/time]: [user]%name%[/user]: %text%[/in]',
	'userSplit': '[sys][time]%time%[/time]: User [user]%name%[/user] left the chat.[/sys]'
};

var bgs = [
	{"name":'Pyramid', "src":'pyramid_background.png'},
	{"name":'Lines', "src":'lines.png'},
	{"name":'Djeans', "src":'dzhins.jpg'},
	{"name":'Blue', "src":'blue.jpg'},
	{"name":'Pyramid', "src":'pyramid_background.png'},
	{"name":'Lines', "src":'lines.png'},
	{"name":'Djeans', "src":'dzhins.jpg'},
	{"name":'Blue', "src":'blue.jpg'},
	{"name":'Pyramid', "src":'pyramid_background.png'},
	{"name":'Lines', "src":'lines.png'},
	{"name":'Djeans', "src":'dzhins.jpg'},
	{"name":'Blue', "src":'blue.jpg'}
];
var getRandomInt = fabric.util.getRandomInt;

function extend(Child, Parent) {
	var F = function() { }
	F.prototype = Parent.prototype
	Child.prototype = new F()
	Child.prototype.constructor = Child
	Child.superclass = Parent.prototype
}

function pad(str, length) {
	while (str.length < length) {
		str = '0' + str;
	}
	return str;
};


function getRandomColor() {
	return (
		pad(getRandomInt(0, 255).toString(16), 2) +
		pad(getRandomInt(0, 255).toString(16), 2) +
		pad(getRandomInt(0, 255).toString(16), 2)
	);
}

function log(obj){
	console.log(obj);
}