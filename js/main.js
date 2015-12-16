//初始化
init(50,"can",320,480,main);


//变量
var backLayer,loadingLayer,graphicsMap,nextLayer;
var imglist = {};
var imgData = new Array(
		{name : 'backImage', path : 'img/back.jpg'}
		//{name : 'floorImage', path : ''},
		//{name : 'hero', path : ''}
	);
//main
function main () {
	
	backLayer = new LSprite();
	addChild(backLayer);
	loadingLayer = new LoadingSample3();
	backLayer.addChild(loadingLayer);
	LLoadManage.load(
		imgData,
		function(p){
			loadingLayer.setProgress(p);
		},
		gameInit);

}
function gameInit (result) {
	imglist = result;
	backLayer.removeChild(loadingLayer);
	loadingLayer = null;
	alert("ok");
	
}