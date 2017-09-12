gf.Map.DrawingManager.js
===========

**A jQuery plugin which wrap Google Map drawing manager ** 

Dependencies
--------
1. jQuery
2. Google Map Javascript API with drawing library

How to Use
--------

1. 引用jQuery
2. 引用Google Map Javascript API with drawing library
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=drawing"></script>
```
3. 引用gf.Map.DrawingManager.js
4. 初始化map
```js
map = new google.maps.Map(document.getElementById('map'), {
    center: {
        lat: 23.98,
        lng: 120.98
    },
    zoom: 7
});
```
5. 增加一個div
```html
<div id='divForDrawingManager'></div>
```
6. 初始化繪圖管理員
```js
$('#divForDrawingManager').gfMapDrawingManager({
    targetMap: map    
});
```

Documentation
-------------
### 參數說明
| 參數名稱     | 說明                        | 型別              | 必要性  |  預設值|
|-------------|----------------------------|------------------|--------|-------|
| targetMap   | 目標Google Map實例     | google.maps.Map  |  必要  |       |
| readonly    | 是否啟用唯讀模式              | Boolean          |        |  false|
| mode        | 可指定要啟用的繪圖模式                     | Array  |   | ["null", "marker", "polyline", "polygon", "rectangle", "circle", "delete"]  |
| css    | 繪圖管理員容器的樣式              | CSS          |        |  |
| iconContainerCss    | 繪圖管理員圖示容器的樣式              | CSS          |        |  |
| iconCss    | 繪圖管理員圖示的樣式              | CSS          |        |  |
| onInitComplete    | 繪圖管理員初始化完成後的callback              | Function          |        |  |

### 方法說明
| 方法名稱     | 說明                        | 參數              | 回傳  |  預設值|
|-------------|----------------------------|------------------|--------|-------|
| getInstance   | 取得Google Map Drawing Manager實例     |   |  google.maps.drawing.DrawingManager  |       |
| getTargetMap   | 取得繪圖管理員綁定的Google Map實例     |   |  google.maps.Map  |       |
| getGeoJsonData   | 取得目前所匯圖形的GeoJson Collection     |   |  FeatureCollection  |       |
| addGeoJsonData   | 輸入GeoJson Collection，繪製於圖面上     | FeatureCollection  |   |       |
| setDrawingMode   | 手動指定繪圖模式     | 可輸入以下任一："null", "marker", "polyline", "polygon", "rectangle", "circle", "delete"  |    |       |
| clear   | 清除所有目前所匯圖形    |   |   |       |
License
-------------
* [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)