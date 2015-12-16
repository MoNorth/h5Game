var SpriteSheet = new function() {
	this.map = {};
	this.load = function(spriteData,callback)
				{
					this.map = spriteData;
					this.image = new Image();
					this.image.onload = callback;
					this.image.src = "img/sprites.png";
				}
	this.draw = function(ctx,sprite,x,y,frame)
				{
					var s = this.map[sprite];
					if(!frame)
						frame = 0;
					ctx.drawImage(this.image, s.sx + frame * s.w, s.sy, s.w, s.h, x, y, s.w, s.h);
				}
}

var Game = new function(canvasElementId,sprite_data,callback)
{
	this.width = "";
	this.canvas = {};
	this.height = "";
	this.ctx = {};
	var KEY_CODE = {
		37 : 'left',
		39 : 'right',
		32 : 'fire'
	};
	this.keys = {};
	this.setupInput = function()
	{
		window.addEventListener("keydown",function(e){
			if(KEY_CODE[e.keyCode])
			{
				Game.keys[KEY_CODE[e.keyCode]] = true;
				e.preventDefault();
			}
		},false);
		window.addEventListener("keyup",function(e){
			if(KEY_CODE[e.keyCode])
			{
				Game.keys[KEY_CODE[e.keyCode]] = false;
				e.preventDefault();
			}
		},false);

	};
	var borads = [];
	this.loop = function(){
		var dt = 30 / 1000;
		for(var i = 0, len = borads.length; i < len; i++)
		{
			if(borads[i])
			{
				borads[i].step(dt);
				borads[i] && borads[i].draw(Game.ctx);
			}
		}
		setTimeout(Game.loop,30);
	};
	this.setBoard = function(num,borad)
	{
		borads[num] = borad;
	}
	this.init = function(canvasElementId,sprite_data,callback)
				{
					this.canvas = document.getElementById(canvasElementId);

					this.playerOffset = 10;
					this.canvasMultiplier = 1;
					this.setupMoblie();


					this.width = this.canvas.width;
					this.height = this.canvas.height;
					this.ctx = this.canvas.getContext && this.canvas.getContext("2d");
					if(!this.ctx)
						return alert("不支持");
					this.setupInput();

					if(this.mobile)
						this.setBoard(4,new TouchControls());

					this.loop();


					SpriteSheet.load(sprite_data,callback);
				}


	this.setupMoblie = function(){

		var container = document.getElementById('container'),
			hasTouch = !!('ontouchstart' in window),
			w = window.innerWidth, h = window.innerHeight;

		if(hasTouch)
			this.mobile = true;
		if(screen.width >= 1280 || !hasTouch)
			return false;

		if(w > h)
		{
			alert("横屏啦！");
			w = window.innerWidth; h = window.innerHeight;
		}

		container.style.height = h * 2 + 'px';
		window.scrollTo(0,1);
		h = window.innerHeight + 2;

		container.style.height = h + 'px';
		container.style.width = w + 'px';
		container.style.padding = 0;

		if(h >= this.canvas.height * 1.75 ||
		   w >= this.canvas.height * 1.75){
			this.canvasMultiplier = 2;
			this.canvas.width = w / 2;
			this.canvas.height = h / 2;
			this.canvas.style.width = w + 'px';
			this.canvas.style.height = h + 'px';

		}else{
			this.canvas.width = w;
			this.canvas.height = h;
		}
		this.canvas.style.position = 'absolute';
		this.canvas.style.top = '0px';
		this.canvas.style.left = '0px';


	}
}



var GameBoard = function(){

	var board = this;
	this.objects = [];
	this.cnt = [];


	this.add = function(obj){
		obj.board = this;
		this.objects.push(obj);
		this.cnt[obj.type] = (this.cnt[obj.type] || 0) + 1;
		return obj;
	}
	this.remove = function(obj)
	{

		var wasStillAlive = this.removed.indexOf(obj) != 1;
		if(wasStillAlive)
		{
			this.removed.push(obj);
		}

		return wasStillAlive;
	}

	this.resetRemoves = function()
	{
		this.removed = [];
	}

	this.finalizeRemoved = function(){
		for(var i = 0, len = this.removed.length; i < len; i++)
		{
			var idx = this.objects.indexOf(this.removed[i]);
			if(idx != -1)
			{
				this.cnt[this.removed[i].type] --;
				this.objects.splice(idx,1);
			}
		}
	}

	this.iterate = function(funcName)
	{
		var args = Array.prototype.slice.call(arguments,1);
		for(var i = 0, len = this.objects.length; i < len; i++)
		{
			var obj = this.objects[i];
			obj[funcName].apply(obj,args);
		}
	}


	this.detect = function(func){
		for(var i = 0, len = this.objects.length; i < len; i++){
			if(func.call(this.objects[i]))
				return this.objects[i];
		}
		return false;


	}

	this.step = function(dt){
		this.resetRemoves();
		this.iterate('step',dt);
		this.finalizeRemoved();
	}

	this.draw = function(ctx)
	{
		this.iterate('draw',ctx);
	}

	this.overlap = function(o1,o2)
	{
		return !((o1.y + o1.h - 1 < o2.y)
			  || (o1.y > o2.y + o2.h - 1)
			  || (o1.x + o1.w - 1 < o2.x)
			  || (o1.x > o2.x + o2.w - 1)
			);
	}

	this.collide = function(obj,type)
	{
		return this.detect(function(){
			if(obj != this)
			{
				var col = (!type || this.type & type) && board.overlap(obj,this);
				return col ? this : false;
			}
		});
	}

}



var Sprite = function(){}

Sprite.prototype.setup = function(sprite,props){
	this.sprite = sprite;
	this.merge(props);
	this.frame = this.frame || 0;
	this.w = SpriteSheet.map[sprite].w;
	this.h = SpriteSheet.map[sprite].h;
}
Sprite.prototype.merge = function(props){
	if(props){
		for(var prop in props){
			this[prop] = props[prop];
		}
	}
}
Sprite.prototype.draw = function(ctx){
	SpriteSheet.draw(ctx,this.sprite,this.x,this.y,this.frame);
}
Sprite.prototype.hit = function(damage){
	this.health -= damage;
	if(this.health <= 0)
	{
		if(this.board.remove(this))
		{
			this.board.add(new Explosion(this.x + this.w / 2, this.y + this.h / 2));
		}
	}
	
}


var Explosion = function(centerX,centerY){
	this.setup('explosion',{frame : 0});
	this.x = centerX - this.w / 2;
	this.y = centerY - this.h / 2;
	this.subFrame = 0;
}
Explosion.prototype = new Sprite();
Explosion.prototype.step = function(dt){
	this.frame = Math.floor(this.subFrame ++ /3);
	if(this.subFrame >= 36){
		this.board.remove(this);
	}
}


var TouchControls = function(){
	var gutterWidth = 10;
	var unitWidth = Game.width / 5;
	var blockWidth = unitWidth - gutterWidth;

	this.drawSquare = function(ctx,x,y,txt,on){
		ctx.globalAlpha = on ? 0.9 : 0.6;
		ctx.fillStyle = "#ccc";
		ctx.fillRect(x,y,blockWidth,blockWidth);

		ctx.fillStyle = "#fff";
		ctx.textAlign = 'center';
		ctx.globalAlpha = 1.0;
		ctx.font = "bold " + (3 * unitWidth / 4) + "px";
		ctx.fillText(txt,x + blockWidth / 2,y + 3 * blockWidth / 4 + 5);

	}

	this.draw = function(ctx){
		ctx.save();
		var yLoc = Game.height - unitWidth;
		this.drawSquare(ctx,gutterWidth,yLoc,"\u25C0",Game.keys["left"]);
		this.drawSquare(ctx,gutterWidth + unitWidth,yLoc,"\u25B6",Game.keys["right"]);
		this.drawSquare(ctx,4 * unitWidth,yLoc,"A",Game.keys["fire"]);
		ctx.restore();
	}
	this.step = function(dt){};

	this.trackTouch = function(e){
		var touch,x;
		e.preventDefault();
		Game.keys['left'] = false;
		Game.keys['right'] = false;

		for(var i = 0; i < e.targetTouches.length; i++){
			touch = e.targetTouches[i];
			x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
			if(x < unitWidth){
				Game.keys['left'] = true;
			}
			if(x > unitWidth && x < 2 * unitWidth){
				Game.keys['right'] = true;
			}

		}

		if(e.type == 'touchstart' || e.type == 'touchend'){
			for(var i = 0; i < e.changedTouches.length; i++){
				touch = e.changedTouches[i];
				x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
				if(x > 4 * unitWidth){
					Game.keys['fire'] = (e.type == 'touchstart');
				}
			}
		}

	}


	Game.canvas.addEventListener('touchstart',this.trackTouch,true);
	Game.canvas.addEventListener('touchend',this.trackTouch,true);
	Game.canvas.addEventListener('touchmove',this.trackTouch,true);

	Game.playerOffset = unitWidth + 20;
}

























