// 初始化一些参数
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d")

var RADIUS = 5;
var COLOR = "#FF0000";
var ANOTHER_COLOR = "#03A9F4";

var ROOT = new Object();

// 当前节点所在深度的所有节点间 x 轴间距
var MARGIN_X = function(node){
	var wide = canvas.width/(Math.pow(2, getRelativeDepth(node))+1);
	return wide
};

// 所有节点 y 轴间距
var MARGIN_Y = function(){
	// return canvas.height/getDepth(ROOT, 1)
	return 100
};

// 判断对象是否为空
function isEmptyObject(anObject) {
    var key;
    for (key in anObject) {
        return false;
    }
    return true;
}

// 根据参数画线
function drawLine(fromX, fromY, toX, toY) {
	context.moveTo(fromX, fromY);
	context.lineTo(toX, toY);
	context.stroke();
}

// 根据参数画圆
function drawCircle(x, y, radius, color) {
	context.fillStyle = color;
	context.beginPath();
	context.arc(x, y, radius, 0, Math.PI*2, true);
	context.closePath();
	context.fill();
	context.stroke();
}

// 改变 canvas 中图形颜色
function changeColor(color){
	context.fillStyle = color;
	context.fill();
}

// 初始化根节点
function getRootNode() {
	var node = {
		posX: 0,
		posY: 0,
		leftChild: new Object(),
		rightChild: new Object()
	};

	return node;
}

// 添加子节点 - 用于完全二叉树
function addChild(node){
	if(isEmptyObject(node.leftChild)){
		node.leftChild = {
			posX: 0,
			posY: 0,
			leftChild: new Object(),
			rightChild: new Object()
		};
	}else if(isEmptyObject(node.rightChild)){
		node.rightChild = {
			posX: 0,
			posY: 0,
			leftChild: new Object(),
			rightChild: new Object()
		};
	}
}

// 添加左子节点
function addLeftChild(node){
	node.leftChild = {
		posX: 0,
		posY: 0,
		leftChild: new Object(),
		rightChild: new Object()
	};
}
// 添加右子节点
function addRightChild(node){
	node.leftChild = {
		posX: 0,
		posY: 0,
		leftChild: new Object(),
		rightChild: new Object()
	};
}

// 获取以此节点为根节点的树的深度
function getDepth(node, depth) {
	if(!isEmptyObject(node.leftChild)){
		depth++;
		var depthFromLeft = getDepth(node.leftChild, depth)
		var depthFromRight = 0;
		if(!isEmptyObject(node.rightChild)){
			depthFromRight = getDepth(node.rightChild, depth);
		}
		return depthFromLeft>depthFromRight?depthFromLeft:depthFromRight;
	}
	return depth
}

// 获取子节点的相对深度
function getRelativeDepth(node){
	return getDepth(ROOT, 1)-getDepth(node, 1)
}

// 将树转换成前序排列的数组
function transformTreeToPreOrderArray(node, treeArr){
	treeArr.push(node);
	if(!isEmptyObject(node.leftChild)){
		transformTreeToPreOrderArray(node.leftChild, treeArr);
	};
	if(!isEmptyObject(node.rightChild)){
		transformTreeToPreOrderArray(node.rightChild, treeArr);
	};

	return treeArr
}

// 将树转换成前序排列的数组
function transformTreeToInOrderArray(node, treeArr){
	if(!isEmptyObject(node.leftChild)){
		transformTreeToInOrderArray(node.leftChild, treeArr);
	};
	treeArr.push(node);
	if(!isEmptyObject(node.rightChild)){
		transformTreeToInOrderArray(node.rightChild, treeArr);
	};

	return treeArr
}

// 将树转换成前序排列的数组
function transformTreeToPostOrderArray(node, treeArr){
	if(!isEmptyObject(node.leftChild)){
		transformTreeToPostOrderArray(node.leftChild, treeArr);
	};
	if(!isEmptyObject(node.rightChild)){
		transformTreeToPostOrderArray(node.rightChild, treeArr);
	};
	treeArr.push(node);

	return treeArr
}

// 打印指定节点
function showNode(node) {
	context.fillStyle= COLOR;
	context.beginPath();
	context.arc(node.posX, node.posY, RADIUS, 0, Math.PI*2, true);
	context.closePath();
	context.fill();
}

// 打印树
function play(order) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	clearInterval();
	clearTimeout();

	var treeArr = [];
	if(order=="PreOrder"){
		treeArr = transformTreeToPreOrderArray(ROOT, []);
	}else if(order=="InOrder"){
		treeArr = transformTreeToInOrderArray(ROOT, []);
	}else{
		treeArr = transformTreeToPostOrderArray(ROOT, []);
	}


	var i = 0;
	var l = treeArr.length
	var interval = setInterval(function(){
				if(i >= l){
					clearInterval(interval);
					timeout = setTimeout(function(){
								clearTimeout(timeout);
								changeColor(ANOTHER_COLOR);
								context.beginPath();
							}, 500);
				}else{
					changeColor(ANOTHER_COLOR);
					showNode(treeArr[i]);
					i++;
				}
			}, 500);
}

// 初始化树
function initTree(){
	ROOT = getRootNode();
	addChild(ROOT);
	addChild(ROOT);
	addChild(ROOT.leftChild);
	addChild(ROOT.leftChild);
	addChild(ROOT.leftChild.leftChild);
	addChild(ROOT.leftChild.leftChild);
	addChild(ROOT.leftChild.rightChild);
	addChild(ROOT.leftChild.rightChild);
	addChild(ROOT.rightChild);
	addChild(ROOT.rightChild);
	addChild(ROOT.rightChild.leftChild);
	addChild(ROOT.rightChild.leftChild);
	addChild(ROOT.rightChild.rightChild);
	addChild(ROOT.rightChild.rightChild);
}

// 初始化树中节点坐标
function initPosition(fatherX, fatherY, child, which){
	child.posX = which=="l"?fatherX - MARGIN_X(child)/2:which=="r"?fatherX + MARGIN_X(child)/2:fatherX + MARGIN_X(child);
	child.posY = fatherY + MARGIN_Y();
	if(!isEmptyObject(child.leftChild)){
		initPosition(child.posX, child.posY, child.leftChild, "l")
	}
	if(!isEmptyObject(child.rightChild)){
		initPosition(child.posX, child.posY, child.rightChild, "r")
	}
}

// go go go
initTree();
initPosition(0, 0, ROOT, "root");










