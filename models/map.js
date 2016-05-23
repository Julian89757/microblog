window.map = false;
window.mode = 0;                       // 播放模式0 还是地图模式1
window.flag = 0;                       // 编辑模式1 还是加载模式0
window.markers = [];
window.markerClusterer = false;

// #region 自定义情景控件

function ZoomControl() {
	this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
	this.defaultOffset = new BMap.Size(10, 40);
}

if (window.BMap && window.BMap.Control) {
	ZoomControl.prototype = new BMap.Control();
}

ZoomControl.prototype.initialize = function (map) {
	// 创建一个DOM元素
	var div = document.createElement("div");
	// 添加文字说明
	div.appendChild(document.createTextNode("编辑标记"));
	// 设置样式
	div.style.cursor = "pointer";
	div.style.border = "1px solid #A6C2DE";
	div.style.backgroundColor = "#8BA4DC";
	div.style.color = "white";
	div.style.padding = "5px";
	// 绑定事件,点击一次放大两级
	div.onclick = function (e) {
		if (flag == 0) {
			flag = 1;
			div.childNodes[0].textContent = "退出编辑";
		} else {
			flag = 0;
			div.childNodes[0].textContent = "编辑标记";
		}
	}
	// 添加DOM元素到地图中
	map.getContainer().appendChild(div);
	// 将DOM元素返回
	return div;
}

//#endregion 自定义控件部分

// #region 地图创建部分

//创建和初始化地图函数：
function initMap() {
	createMap();						//创建地图
	setMapEvent();						//设置地图事件
	addMapControl();					//向地图添加控件
}

//创建地图函数：
function createMap() {
	map = new BMap.Map("allmap");
	map.centerAndZoom(new BMap.Point(106.267089, 38.519694), 5);  // 初始化地图,设置中心点坐标(银川)和地图级别

	// 地图显示根据IP 定位
	/*var local = new BMap.LocalCity();
	local.get(function (LocalCityResult) {
		map.centerAndZoom(LocalCityResult.center,13);
	});*/

	map.enableScrollWheelZoom(true);
	// 扩展原生Map地图函数【定位标记】
	BMap.Map.prototype.GetOverlay = function (tmp) {
		var overlays = this.getOverlays();
		for (x in overlays) {
			if (!!overlays[x]._option && overlays[x]._option.id == tmp)
				return overlays[x];
		}
	};
}

//地图事件设置函数：
function setMapEvent() {
	map.enableDragging();				//启用地图拖拽事件，默认启用(可不写)
	map.enableScrollWheelZoom();		//启用地图滚轮放大缩小
	map.enableDoubleClickZoom();		//启用鼠标双击放大，默认启用(可不写)
	map.enableKeyboard();				//启用键盘上下左右键移动地图
}

//地图控件添加函数：
function addMapControl() {
	map.addControl(new BMap.MapTypeControl());
	//向地图中添加缩放控件
	var ctrl_nav = new BMap.NavigationControl({ anchor: BMAP_ANCHOR_TOP_LEFT, type: BMAP_NAVIGATION_CONTROL_LARGE });
	map.addControl(ctrl_nav);
	//向地图中添加缩略图控件
	var ctrl_ove = new BMap.OverviewMapControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT, isOpen: 1 });
	map.addControl(ctrl_ove);
	//向地图中添加比例尺控件
	var ctrl_sca = new BMap.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_LEFT });
	map.addControl(ctrl_sca);

	// 创建自定义控件
	var myZoomCtrl = new ZoomControl();
	map.addControl(myZoomCtrl);

	markerClusterer = new BMapLib.MarkerClusterer(map, { "maxZoom": "9" });

}

// #endregion 


//  添加标记(实时保存)
function createMarker(pt, obj) {
	var dataJson = analyzeTreeData(obj);
	obj.li_attr.lng = pt.lng;
	obj.li_attr.lat = pt.lat;
	try {
		$.ajax({
			url: "/Device/DeviceMarker?id=" + dataJson.id.substring(0, 36) + "&&lat=" + pt.lat + "&&lng=" + pt.lng,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if (!data.Result) {
					Alert.TipInside(data.Msg);
					return;
				}
			}
		});
		var marker = loadMarker(pt, obj);
		markerClusterer.addMarker(marker);
		return true;
	} catch (err) {
		Alert.TipInside(err);
		return false;
	}
}

function loadMarker(pt, obj) {
	var dataJson = analyzeTreeData(obj);
	var myCompOverlay = new ComplexCustomOverlay(pt, dataJson);
	map.addOverlay(myCompOverlay);
	markers.push(myCompOverlay);
	return myCompOverlay;
}

// 解析树节点事件数据data
function analyzeTreeData(obj) {
	var devData = obj.li_attr;
	return devData;
}