// Original game from:
// http://www.lostdecadegames.com/how-to-make-a-simple-html5-canvas-game/
// Slight modifications by Gregorio Robles <grex@gsyc.urjc.es>
// to meet the criteria of a canvas class for DAT @ Univ. Rey Juan Carlos

//Contantes
const LEFT = 1;
const RIGHT = 2;
const UP = 3;
const DOWN = 4;
const ALLPOS = 0;
const MAXNROCKS = 15;
const MAXNMONSTERS = 10;
const INCREMENTVEL = 10;

const SIZEOBJECT = 32;

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
	bgReady = true;
};
bgImage.src = "images/background.png";

// Hero image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function () {
	heroReady = true;
};
heroImage.src = "images/hero.png";

// princess image
var princessReady = false;
var princessImage = new Image();
princessImage.onload = function () {
	princessReady = true;
};
princessImage.src = "images/princess.png";

//monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function(){
	monsterReady = true;
};
monsterImage.src = "images/monster.png";

//stone image
var rockReady = false;
var rockImage = new Image();
rockImage.onload = function(){
	rockReady = true;
};
rockImage.src = "images/stone.png";

// Game objects
var hero = {
	speed: 256 // movement in pixels per second
};
var princess = {};
var princessesCaught = 0;
var rocks =[];
var nrocks = 0;
var monsters = [];
var nmonster = 0;
var speedmonster = 0;
var level = 1;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

// Reset the game when the player catches a princess
var resetHero = function () {
	hero.x = canvas.width / 2;
	hero.y = canvas.height / 2;
};

var checkSuperposition = function(obj1, obj2){

	if (checkPos(obj1.x, obj2.x) && checkPos(obj2.x, obj1.x)
	&& checkPos(obj1.y, obj2.y) && checkPos(obj2.y, obj1.y)
	){
		return false;
	}
	return true;
};

var checkPos = function(pos1, pos2){
	if((pos1 - 16) <= (pos2 + 16)){
		return true;
	}
	return false;
};

var checkPositionMonsters = function(obj){
	var m = {};
	for(i=0; i<nmonster; i++){
		m = monsters[i];
		if(m == undefined){
			return false;
		}
		if (!checkSuperposition(obj, m)
		){
			return  true;
		}
	}
	return false;
};

var checkPositionRocks = function(obj){
	var rock = {};
	for(i=0; i<nrocks; i++){
		rock = rocks[i];
		if(rock == undefined){
			return false;
		}
		if (!checkSuperposition(obj, rock)){
			return  true;
		}
	}
	return false;
};

var isNearRock = function(obj, pos){
	switch (pos){
		case LEFT:
			return nearRock(obj.x-10, obj.y);
			break;
		case RIGHT:
			return nearRock(obj.x+10, obj.y);
			break;
		case UP:
			return nearRock(obj.x, obj.y - 10);
			break;
		case DOWN:
			return nearRock(obj.x, obj.y + 10);
			break;
	}
};

var nearRock = function(x, y){
	for(i=0; i<nrocks; i++){
		if((Math.sqrt(Math.pow((x - rocks[i].x), 2)
					+ Math.pow((y - rocks[i].y), 2))) < 32){
						return false;
					}
	}
	return true;
};


var positionRamdom = function(margin){
		var pos = (Math.random()*(margin - 64));
		if(pos <= 32){
			pos = pos + 32;
		}
		return pos;
};

var resetPrincess = function(){
	// Throw the princess somewhere on the screen randomly
	do{
		princess.x = positionRamdom(canvas.width);
		princess.y = positionRamdom(canvas.height);
	}while(checkPositionRocks(princess));
};

var resetMosters = function(){
	monsters = [];
	for(i=0; i<nmonster; i++){
		var m = {};
		do{
			m.x = positionRamdom(canvas.width);
			m.y = positionRamdom(canvas.height);
		}while(!checkSuperposition(m, princess)
		|| !checkSuperposition(m, hero)
		|| checkPositionRocks(m)
	 	|| checkPositionMonsters(m));

		monsters[i]=m;
	}
};

var resetRocks = function(){
	rocks = [];
	for(i = 0; i<nrocks; i++){
		var rock = {};
		do{
			rock.x = positionRamdom(canvas.width);
			rock.y = positionRamdom(canvas.height);
		}while(checkPositionRocks(rock)
		 || !checkSuperposition(hero ,rock));
		rocks[i]=rock;
	}
};

var resetAll = function(){
	resetHero();
	resetRocks();
	resetPrincess();
	resetMosters();
	princessesCaught = 0;
	level = 1;
	nmonster = 0;
	nrocks = 0;
	speedmonster = 0;
};

//Movimiento del Heroe
var moveHero = function(modifier){
	if (38 in keysDown && isNearRock(hero, UP)) { // Player holding up
		if(hero.y >=(32)){ //Impide que salga por arriba
			hero.y -= hero.speed * modifier;
		}
	}
	if (40 in keysDown) { // Player holding down
		if(hero.y <=((canvas.height-64)) && isNearRock(hero, DOWN)){ //Impide que salga por abajo
			hero.y += hero.speed * modifier;
		}
	}
	if (37 in keysDown && isNearRock(hero, LEFT)) { // Player holding left
		if(hero.x >= 32){//Impide salir por la izquierda
			hero.x -= hero.speed * modifier;
		}
	}
	if (39 in keysDown && isNearRock(hero, RIGHT)) { // Player holding right
		if(hero.x <= ((canvas.width - 64))){ //impide salir por la derecha
			hero.x += hero.speed * modifier;
		}
	}
};

//Movimiento del monstruo
var moveMonster = function(modifier){
	var m = {};
	for(k=0; k<nmonster; k++){
		m = monsters[k];
		if(hero.x > m.x && isNearRock(m, RIGHT)){
			m.x += speedmonster * modifier;
		}
		if(hero.x < m.x && isNearRock(m, LEFT)){
			m.x -= speedmonster * modifier;
		}
		if(hero.y > m.y && isNearRock(m, UP)){
			m.y += speedmonster * modifier;
		}
		if(hero.y < m.y && isNearRock(m, DOWN)){
			m.y -= speedmonster * modifier;
		}
		if (
			hero.x <= (m.x + 16)
			&& m.x <= (hero.x + 16)
			&& hero.y <= (m.y + 16)
			&& m.y <= (hero.y + 32)
		){
			resetAll();
		}
	}
}

var touchprincess = function(){
	// Are they touching?
	if (
		hero.x <= (princess.x + 16)
		&& princess.x <= (hero.x + 16)
		&& hero.y <= (princess.y + 16)
		&& princess.y <= (hero.y + 32)
	) {
		++princessesCaught;
		resetPrincess();
		return true;
	}
	return false;
};

var upLevelMonster = function(){
	if(speedmonster < hero.speed){
		speedmonster += INCREMENTVEL;
	}
	if(nmonster < MAXNMONSTERS){
		nmonster++;
	}
};

var moreRocks = function(){
	if(nrocks < MAXNROCKS){
		nrocks++;
	}
};

//uplevel
var upLevel = function(){
	if(touchprincess() == true && (princessesCaught % 5 == 0)){
		level++;
		upLevelMonster();
		moreRocks();
		resetHero();
		resetRocks();
		resetPrincess();
		resetMosters();
		saveStatus();
	}
};

// Update game objects
var update = function (modifier) {
	moveHero(modifier);
	moveMonster(modifier);
	upLevel();
};

// Draw everything
var render = function () {
	if (bgReady) {
		ctx.drawImage(bgImage, 0, 0);
	}

	if (heroReady) {
		ctx.drawImage(heroImage, hero.x, hero.y);
	}

	if (princessReady) {
		ctx.drawImage(princessImage, princess.x, princess.y);
	}

	if(rockReady){
		for(j=0; j<nrocks; j++){
			var rock = {};
			rock = rocks[j];
			ctx.drawImage(rockImage, rock.x, rock.y);
		}
	}

	if(monsterReady){
		for(i=0 ;i<nmonster; i++){
			var m = {};
			m = monsters[i];
			ctx.drawImage(monsterImage, m.x, m.y);
		}
	}

	// Score
	ctx.fillStyle = "rgb(250, 250, 250)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Princesses caught: " + princessesCaught + "  Level: "+level, 32, 32);
};

var saveStatus = function(){

  localStorage.setItem("level", level);
	localStorage.setItem("nrocks", nrocks);
	localStorage.setItem("nmonster", nmonster);
	localStorage.setItem("princess", princessesCaught);
	localStorage.setItem("velmonster", velmonster);

};

var chargeConst = function(){
	level = localStorage.getItem("level");
	nrocks = localStorage.getItem("nrocks");
	nmonster = localStorage.getItem("nmonster");
	princessesCaught = localStorage.getItem("princess");
	velmonster = localStorage.getItem("velmonster");
};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000);
	render();

	then = now;
};

// Let's play this game!
chargeConst();
resetAll();


var then = Date.now();
//The setInterval() method will wait a specified number of milliseconds, and then execute a specified function, and it will continue to execute the function, once at every given time-interval.
//Syntax: setInterval("javascript function",milliseconds);
setInterval(main, 1); // Execute as fast as possible
