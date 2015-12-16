// var canvas = document.getElementById('game');
// var ctx = canvas.getContext("2d");
// if(!ctx)
// {
// 	alert("不支持");
// }
// else
// {
// 	startGame();
// }

var OBJECT_PLAYER = 1,
	OBJECT_PLAYER_PROJECTILE = 2,
	OBJECT_ENEMY = 4,
	OBJECT_ENEMY_PROJECTILE = 8,
	OBJECT_POWERUP = 16;


var sprites = {
	ship : {
				sx : 0,
				sy : 0,
				w : 39,
				h : 42,
				frame : 0
			},
	missile : {
				sx : 0,
				sy : 42,
				w : 7,
				h : 20,
				frame : 1
	},
	explosion : {
				sx : 0,
				sy : 64,
				w : 64,
				h : 64,
				frame : 11
	}
		};

var enemies = {
	straight : {
		x : 0, y : -50, sprite : 'ship', E : 100, health : 10, damage : 20, frame : 1
	},
	ltr : {
		x : 0, y : -100, sprite : 'ship', B : 200, C : 1, E : 200, health : 10, damage : 20, frame : 2
	},
	circle : {
		x : 400, y : -50, sprite : 'ship', A : 0, B : -200, C : 1, E : 20, F : 200, G : 1, H : Math.PI / 2, health : 10, damage : 20, frame : 3
	},
	wiggle : {
		x : 100, y : -50, sprite : 'ship', B : 100, C : 4, E : 100, health : 20, damage : 20, frame : 1
	},
	step : {
		x : 0, y : -50, sprite : 'ship', B : 300, C : 1.5, E : 60, health : 10, damage : 20, frame : 2
	}
};



var level1 = [
	[0, 4000, 500,'step'],
	[6000, 13000, 800,'ltr'],
	[12000, 16000, 400,'circle'],
	[18200, 20000, 500,'straight',{x : 150}],
	[18200, 20000, 500,'straight',{x : 100}],
	[18400, 20000, 500,'straight',{x : 200}],
	[22000, 25000, 400,'wiggle',{x : 300}],
	[22000, 25000, 400,'wiggle',{x : 200}]

];

function benginGame()
{
	Game.setBoard(3,new TitleScreen("开始啦",""));
}


function startGame () {
	// SpriteSheet.draw(Game.ctx,'ship',0,0,3);
	// Game.ctx.fillStyle = "#000";
	// Game.ctx.fillRect(0,0,Game.width,Game.height);
	Game.setBoard(0,new Starfield(20,0.4,50,true));
	// Game.setBoard(1,new Starfield(40,0.6,50));
	// Game.setBoard(2,new Starfield(100,0.8,50));
	// Game.setBoard(3,new Playership());
	// Game.setBoard(3,new TitleScreen("准备","开始",benginGame));


	var borad = new GameBoard();
	borad.add(new Playership());
	Game.setBoard(3,borad);
	// borad.add(new Enemy(enemies.basic,{x : 300,frame : 2}));
	// borad.add(new Enemy(enemies.basic,{frame : 1}));
	// borad.add(new Enemy(enemies.basic,{x : 200,frame : 2}));
	borad.add(new Level(level1,function(){alert("win")}));


}

window.addEventListener("load",function(event)
{
	Game.init("game",sprites,startGame);
	// SpriteSheet.load(sprites,function(){
	// 	// SpriteSheet.draw(ctx,'explosion',this.x,this.y,0);
	// 	for(var i= 0;i<12;i++)
	// 	{
	// 		SpriteSheet.draw(ctx,'explosion',64 * i,0,i);
	// 	}
	// });
	
});









var Starfield = function(speed,opacity,numStars,clear)
{
	var stars = document.createElement("canvas");
	stars.width = Game.width;
	stars.height = Game.height;
	var starsCtx = stars.getContext("2d");
	var offset = 0;


	if(clear)
	{
		starsCtx.fillStyle = "#000";
		starsCtx.fillRect(0,0,stars.width,stars.height);
	}

	starsCtx.fillStyle = "#fff";
	starsCtx.globalAlpha = opacity;
	for(var i = 0; i < numStars; i++)
	{
		starsCtx.fillRect(
				Math.floor(Math.random() * stars.width),
				Math.floor(Math.random() * stars.height),
				2,
				2
			);
	}

	this.draw = function(ctx)
	{
		var intOffset = Math.floor(offset);
		var remaining = stars.height - intOffset;
		if(intOffset > 0)
		{
			ctx.drawImage(stars, 0, remaining, stars.width, intOffset, 0, 0, stars.width, intOffset);
		}
		if(remaining > 0)
		{
			ctx.drawImage(stars, 0, 0, stars.width, remaining, 0, intOffset, stars.width, remaining);
		}
	}

	this.step = function(dt)
	{
		offset += dt * speed;
		offset = offset % stars.height;
	}
}


var TitleScreen = function(title,subtitle,callback)
{
	this.step = function(dt)
	{
		if(Game.keys['fire'] && callback)
			callback();
	}
	this.draw = function(ctx)
	{
		ctx.fillStyle = "#fff";
		ctx.textAlign = "center";
		ctx.font = "bold 40px 黑体";
		ctx.fillText(title,Game.width/2,Game.height/2);
		ctx.font = "bold 20px 黑体";
		ctx.fillText(subtitle,Game.width/2,Game.height/2 + 40);
	}
}

var Playership = function(){

	this.setup('ship',{
		vx : 0,
		frame : 0,
		reloadTime : 0.25,
		MaxValue : 500,
		health : 20
	});



	// this.w = SpriteSheet.map['ship'].w;
	// this.h = SpriteSheet.map['ship'].h;
	this.x = Game.width / 2 - this.w / 2;
	this.y = Game.height - Game.playerOffset - this.h;
	// this.vx = 0;
	// this.MaxValue = 500;

	// this.reloadTime = 0.25;
	this.reload = this.reloadTime;


	this.step = function(dt)
	{
		if(Game.keys["left"])
		{
			this.vx = - this.MaxValue;
		}
		else if(Game.keys["right"])
		{
			this.vx = this.MaxValue;
		}
		else
			this.vx = 0;
		this.x += this.vx * dt;

		if(this.x < 0)
			this.x = 0;
		if(this.x > Game.width - this.w)
			this.x = Game.width - this.w;
		this.reload -= dt;
		if(Game.keys['fire'] && this.reload < 0)
		{
			Game.keys['fire'] = false;
			this.reload = this.reloadTime;
			this.board.add(new PlayerMissile(this.x, this.y + this.h / 2));
			this.board.add(new PlayerMissile(this.x + this.w, this.y + this.h / 2));
		}
	}
	// this.draw = function(ctx)
	// {

	// 	SpriteSheet.draw(ctx,'ship',this.x,this.y,0);
	// }
}

Playership.prototype = new Sprite();
Playership.prototype.type = OBJECT_PLAYER;

var PlayerMissile = function(x,y){
	this.setup('missile',{vy : -700, damage : 10});
	this.x = x - this.w / 2;
	this.y = y - this.h;
}
PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_PROJECTILE;

PlayerMissile.prototype.step = function(dt){
	this.y += this.vy * dt;
	var collision = this.board.collide(this,OBJECT_ENEMY);
	if(collision)
	{
		collision.hit(this.damage);
		this.board.remove(this);
	}else	
	if(this.y < -this.h){
		this.board.remove(this);
	}
}

var Enemy = function(blueprint, override){
	this.merge(this.baseParameters);
	this.setup(blueprint.sprite,blueprint);
	this.merge(override);
}
Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;
Enemy.prototype.baseParameters = {
	A : 0, B : 0, C : 0,
	D : 0, E : 0, F : 0,
	G : 0, H : 0, t : 0
};
Enemy.prototype.step = function(dt){
	this.t += dt;
	this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
	this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);
	this.x += this.vx * dt;
	this.y += this.vy * dt;
	var collision = this.board.collide(this,OBJECT_PLAYER);
	if(collision)
	{
		collision.hit(this.damage);
		this.board.remove(this);
	}else
	if(this.y > Game.height ||
		this.x < -this.w ||
		this.x > Game.width)
		this.board.remove(this);
	// alert(this.y);
}


var Level = function(levelData,callback){
	this.levelData = [];
	for(var i = 0, len = levelData.length; i < len; i++){
		this.levelData.push(Object.create(levelData[i]));
	}
	this.t = 0;
	this.callback = callback;
}
Level.prototype.step = function(dt){
	var idx = 0, remove = [], curShip = null;
	this.t += dt * 1000;
	while((curShip = this.levelData[idx]) && (curShip[0] < this.t + 2000)){
		if(this.t > curShip[1])
		{
			remove.push(curShip);
		}
		else if(curShip[0] < this.t){
			var enemy = enemies[curShip[3]],
				override = curShip[4];
			this.board.add(new Enemy(enemy,override));
			curShip[0] += curShip[2];
		}
		idx ++;


	}
	for(var i = 0, len = remove.length; i < len; i++){
		var idx = this.levelData.indexOf(remove[i]);
		if(idx != -1){
			this.levelData.splice(idx,1);
		}
	}

	if(this.levelData.length === 0 && this.board.cnt[OBJECT_ENEMY] === 0)
		if(this.callback)
			this.callback();
}

Level.prototype.draw = function(ctx){};





















