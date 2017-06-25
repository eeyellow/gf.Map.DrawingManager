/* GoogleMap數化工具

Author: Ray
Version
    1.0.0   2017-05-24

*/
//需要 jQuery
;(function($, window, document, undefined) {
    //'use strict';
    var pluginName = 'gfMapDrawingManager'; //Plugin名稱

    //建構式
    var DrawingManager = function(element, opt) {
        this.target = element;

        var initResult = this._init(opt); //初始化
        if (initResult) {
            //初始化成功之後的動作
            this._style();
            this._event();
            this._subscribeEvents();

            this.target.trigger('onInitComplete');
        }
    }

    //預設參數
    DrawingManager.options = {
        targetMap: null,
        css: {
            position: "absolute",
            top: "0",
            right: "0",
            margin: "10px",            
            "border-radius": "3px",
            "background-color": "#FFFFFF",
        },
        iconContainerCss: {
            "padding": "5px",
            //"background-color": "#FFFFFF",
            "cursor": "pointer",
            "border-left": "1px solid rgb(221, 221, 221)",
            "width": "28px",
            "height": "28px",
            "text-align": "center",
            "display": "inline-block",
            //"border-radius": "3px 0px 0px 3px"
        },
        iconCss: {
            width: "16px",
            height: "16px",
            position: "relative",
            //top: "2px"
        },
        selectedShape: null,
        colors: ['#1E90FF', '#FF1493', '#32CD32', '#FF8C00', '#4B0082'],
        btnArr: [
            { mode: "null", icon: "src/hand.png" },
            { mode: "marker", icon: "src/locate.png" },
            { mode: "polyline", icon: "src/draw.png" },
            { mode: "polygon", icon: "src/polygon.png" },
            { mode: "rectangle", icon: "src/rectangle.png" },
            { mode: "delete", icon: "src/delete.png" },
        ],
        markerIcon: {
            default: "images/marker_default.png",
            active: "images/marker_active.png"
        },
        selectedColor: null,
        colorButtons: {},
        drawingManager: null,
        drawingManagerContainer: null,
        shapeTempArr: [],
        polygonOptions: {
            strokeWeight: 0,
            fillOpacity: 0.45,
            fillColor: '#1E90FF',
            editable: false,
            draggable: true
        },
        polylineOptions: {
            geodesic: true,
            strokeWeight: 3,
            strokeColor: '#1E90FF',
            strokeOpacity: 1,
            editable: false,
            draggable: true
        },
        markerOptions: {
            draggable: true
        },
        readonly: false,

        onInitComplete: undefined,
        //onLocateClearComplete: undefined
    }

    //私有方法
    DrawingManager.prototype = {
        //初始化
        _init: function(_opt) {
            //合併自訂參數與預設參數
            try {
                this.options = $.extend(true, {}, DrawingManager.options, _opt);
                return true;
            } catch (ex) {
                return false;
            }
        },
        //樣式
        _style: function() {
            var oCom = this;
            oCom.target
                .css(oCom.options.css);
            var html = "";
            oCom.options.btnArr.forEach(function(ele) {
                html += 
                "<span data-drawmode='" + ele.mode + "'>" +
                    "<img src='" + ele.icon + "' style='' />" +
                "</span>";                                        
            }); 
            oCom.target
                .append(html)
                .find('span')
                    .css(oCom.options.iconContainerCss)
                    .first()
                        .css("border-left", "none")
                        .end()
                    .end()
                .find('img')
                    .css(oCom.options.iconCss)
                    .end()
        },
        //綁定事件
        _event: function() {
            var oCom = this;            
                   
            if(oCom.options.readonly){
                //唯讀模式
                oCom.target.hide();
                
                oCom.options.markerOptions.draggable = false;
                oCom.options.polylineOptions.draggable = false;
                oCom.options.polygonOptions.draggable = false;
            }    
            
            oCom.options.drawingManager = new google.maps.drawing.DrawingManager({
                map: oCom.options.targetMap,
                drawingMode: null,
                drawingControl: false,
                drawingControlOptions: {
                    drawingModes: [
                        google.maps.drawing.OverlayType.MARKER,
                        google.maps.drawing.OverlayType.POLYGON,
                        google.maps.drawing.OverlayType.POLYLINE,
                        google.maps.drawing.OverlayType.CIRCLE,
                        google.maps.drawing.OverlayType.RECTANGLE
                    ]
                },
                markerOptions: {
                    draggable: true
                },
                polylineOptions: {
                    editable: true,
                    draggable: true
                },
                rectangleOptions: oCom.options.polygonOptions,
                circleOptions: oCom.options.polygonOptions,
                polygonOptions: oCom.options.polygonOptions
            });            
            oCom.target.find('span').each(function(s){
                oCom._setDrawingMode("null");
                $(this).click(function(){
                    oCom._setDrawingMode($(this).data().drawmode);
                })
            });
            
            google.maps.event.addListener(oCom.options.drawingManager, 'overlaycomplete', function(e) {
                var newShape = e.overlay;
                newShape.type = e.type;
                if (e.type !== google.maps.drawing.OverlayType.MARKER) {
                    // Switch back to non-drawing mode after drawing a shape.
                    //drawingManager._setDrawingMode(null);
                    oCom._setDrawingMode("null")

                    // Add an event listener that selects the newly-drawn shape when the user
                    // mouses down on it.                                
                    google.maps.event.addListener(newShape, 'click', function(e) {
                        if (e.vertex !== undefined) {
                            if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
                                var path = newShape.getPaths().getAt(e.path);
                                path.removeAt(e.vertex);
                                if (path.length < 3) {
                                    newShape.setMap(null);
                                }
                            }
                            if (newShape.type === google.maps.drawing.OverlayType.POLYLINE) {
                                var path = newShape.getPath();
                                path.removeAt(e.vertex);
                                if (path.length < 2) {
                                    newShape.setMap(null);
                                }
                            }
                        }
                        oCom._setSelection(newShape);
                    });                
                    oCom._setSelection(newShape);
                } else {
                    google.maps.event.addListener(newShape, 'click', function(e) {
                        oCom._setSelection(newShape);
                    });                
                    oCom._setSelection(newShape);
                }

                oCom.options.shapeTempArr.push({
                    shape: newShape,
                    type: e.type
                });
            });
            
            google.maps.event.addListener(oCom.options.drawingManager, 'drawingmode_changed', function(){
                oCom._clearSelection();
            });
                        
            google.maps.event.addListener(oCom.options.targetMap, 'click', function(){
                oCom._clearSelection();
            });
            
            google.maps.Map.prototype.getGeoJson = function(callback) {
                var geo = {
                        "type": "FeatureCollection",
                        "features": []
                    },
                    fx = function(g, t) {

                        var that = [],
                            arr,
                            f = {
                                MultiLineString: 'LineString',
                                LineString: 'Point',
                                MultiPolygon: 'Polygon',
                                Polygon: 'LinearRing',
                                LinearRing: 'Point',
                                MultiPoint: 'Point'
                            };

                        switch (t) {
                            case 'Point':
                                g = (g.get) ? g.get() : g;
                                return ([g.lng(), g.lat()]);
                                break;
                            default:
                                arr = g.getArray();
                                for (var i = 0; i < arr.length; ++i) {
                                    that.push(fx(arr[i], f[t]));
                                }
                                if (t == 'LinearRing' &&
                                    that[0] !== that[that.length - 1]) {
                                    that.push([that[0][0], that[0][1]]);
                                }
                                return that;
                        }
                    };

                this.data.forEach(function(feature) {
                    var _feature = {
                        type: 'Feature',
                        properties: {}
                    }
                    _id = feature.getId(),
                        _geometry = feature.getGeometry(),
                        _type = _geometry.getType(),
                        _coordinates = fx(_geometry, _type);

                    _feature.geometry = {
                        type: _type,
                        coordinates: _coordinates
                    };
                    if (typeof _id === 'string') {
                        _feature.id = _id;
                    }

                    geo.features.push(_feature);
                    feature.forEachProperty(function(v, k) {
                        _feature.properties[k] = v;
                    });
                });
                if (typeof callback === 'function') {
                    callback(geo);
                }
                return geo;
            }
                
            
        },
        
        _clearSelection: function() {            
            var oCom = this;
            if (oCom.options.selectedShape) {
                if (oCom.options.selectedShape.type == 'marker') {
                    oCom.options.selectedShape.setIcon(oCom.options.markerIcon.default);
                } else {
                    oCom.options.selectedShape.setEditable(false);
                    oCom.options.selectedShape.setOptions({
                        strokeColor: '#1E90FF',
                        fillColor: '#1E90FF'
                    });
                }

                oCom.options.selectedShape = null;
            }
        },

        _setSelection: function(shape) {
            var oCom = this;
            oCom._clearSelection();
            if (shape.type == 'marker') {
                shape.setIcon(oCom.options.markerIcon.active);
            } else {
                shape.setEditable(true);
                //_selectColor(shape.get('fillColor') || shape.get('strokeColor'));
                shape.setOptions({
                    strokeColor: '#FF1493',
                    fillColor: '#FF1493'
                });
            }

            oCom.options.selectedShape = shape;
        },

        _getSelection: function() {
            var oCom = this;
            return oCom.options.selectedShape;
        },

        _deleteSelectedShape: function() {
            var oCom = this;
            if (oCom.options.selectedShape) {
                oCom.options.selectedShape.setMap(null);
            }

            for (var i = 0; i < oCom._getShapeArr().length; i++) {
                if (oCom._getShapeArr()[i] != undefined && oCom._getShapeArr()[i].id == oCom.options.selectedShape.id) {
                    oCom._getShapeArr()[i] = null;
                }
            }
        },

        _selectColor: function(color) {
            var oCom = this;
            oCom.options.selectedColor = color;
            for (var i = 0; i < colors.length; ++i) {
                var currColor = colors[i];
                oCom.optionscolorButtons[currColor].style.border = currColor == color ? '2px solid #789' : '2px solid #fff';
            }

            // Retrieves the current options from the drawing manager and replaces the
            // stroke or fill color as appropriate.
            var polylineOptions = oCom.options.drawingManager.get('polylineOptions');
            polylineOptions.strokeColor = color;
            oCom.options.drawingManager.set('polylineOptions', polylineOptions);

            var rectangleOptions = oCom.options.drawingManager.get('rectangleOptions');
            rectangleOptions.fillColor = color;
            oCom.options.drawingManager.set('rectangleOptions', rectangleOptions);

            var circleOptions = oCom.options.drawingManager.get('circleOptions');
            circleOptions.fillColor = color;
            oCom.options.drawingManager.set('circleOptions', circleOptions);

            var polygonOptions = oCom.options.drawingManager.get('polygonOptions');
            polygonOptions.fillColor = color;
            oCom.options.drawingManager.set('polygonOptions', polygonOptions);
        },

        _getShapeArr: function() {
            var oCom = this;            
            return oCom.options.shapeTempArr;
        },

        /**
         * 設定繪圖模式，參數可為"null", "marker", "polyline", "polygon", "circle", "rectangle"
         * @param {[type]} mode [description]
         */
        _setDrawingMode: function(mode) {  
            var oCom = this;                  
            oCom.target
                .find('span[data-drawmode=' + mode + ']')
                .children('img')
                .each(function(){
                    var imgsrc = $(this).attr('src');
                    if(!imgsrc.includes("_active")){
                        $(this).attr('src', imgsrc.replace(".png", "_active.png"));
                    }
                })
                .end()
                .siblings()
                .children('img')
                .each(function(){
                    var imgsrc = $(this).attr('src');
                    $(this).attr('src', imgsrc.replace("_active", ""));
                });

                switch (mode) {
                    case "null":
                        oCom.options.drawingManager.setDrawingMode(null);
                        break;
                    case "delete":
                        try {
                            oCom._deleteSelectedShape(oCom._getSelection());
                        } catch (ex) {

                        } finally {
                            setTimeout(function() {
                                oCom._setDrawingMode("null");
                            }, 200);
                        }
                        break;
                    default:                    
                        oCom.options.drawingManager.setDrawingMode(mode);
                        break;
                }           
        },

        _getGeoJsonData: function() {
            oCom.options.targetMap.data.setStyle({
                visible: false
            });
            oCom.options.shapeTempArr.forEach(function(obj) {
                if (obj != undefined) {
                    switch (obj.type) {
                        case google.maps.drawing.OverlayType.MARKER:
                            oCom.options.targetMap.data.add(new google.maps.Data.Feature({
                                geometry: new google.maps.Data.Point(obj.shape.getPosition())
                            }));
                            break;
                        case google.maps.drawing.OverlayType.RECTANGLE:
                            var b = obj.shape.getBounds(),
                                p = [b.getSouthWest(), {
                                    lat: b.getSouthWest().lat(),
                                    lng: b.getNorthEast().lng()
                                }, b.getNorthEast(), {
                                    lng: b.getSouthWest().lng(),
                                    lat: b.getNorthEast().lat()
                                }]
                            oCom.options.targetMap.data.add(new google.maps.Data.Feature({
                                geometry: new google.maps.Data.Polygon([p])
                            }));
                            break;
                        case google.maps.drawing.OverlayType.POLYGON:
                            oCom.options.targetMap.data.add(new google.maps.Data.Feature({
                                geometry: new google.maps.Data.Polygon([obj.shape.getPath().getArray()])
                            }));
                            break;
                        case google.maps.drawing.OverlayType.POLYLINE:
                            oCom.options.targetMap.data.add(new google.maps.Data.Feature({
                                geometry: new google.maps.Data.LineString(obj.shape.getPath().getArray())
                            }));
                            break;
                        case google.maps.drawing.OverlayType.CIRCLE:
                            oCom.options.targetMap.data.add(new google.maps.Data.Feature({
                                properties: {
                                    radius: obj.shape.getRadius()
                                },
                                geometry: new google.maps.Data.Point(obj.shape.getCenter())
                            }));
                            break;
                    }
                }
            });

            var result = oCom.options.targetMap.getGeoJson();
            oCom.options.targetMap.data.forEach(function(feature) {
                oCom.options.targetMap.data.remove(feature);
            });
            return result;

        },

        _addGeoJsonData: function(featureCollection) {
            var featureCollectionArray = [];
            featureCollection.features.forEach(function(feature) {
                switch (feature.geometry.type.toLowerCase()) {
                    case "point":
                        var myLatLng = {
                            lat: feature.geometry.coordinates[1],
                            lng: feature.geometry.coordinates[0]
                        };
                        var obj;
                        if (feature.properties.radius == undefined) {
                            //點
                            obj = new google.maps.Marker();
                            obj.setOptions(oCom.options.markerOptions);
                            obj.setPosition(myLatLng);
                            obj.setIcon(oCom.options.markerIcon.default);
                            obj.type = "marker";
                            obj.id = oCom.options.shapeTempArr.length;
                            featureCollectionArray.push({
                                shape: obj,
                                type: google.maps.drawing.OverlayType.MARKER,
                                id: oCom.options.shapeTempArr.length
                            });
                        } else {
                            //圓
                            obj = new google.maps.Circle();
                            obj.setCenter(myLatLng);
                            obj.setRadius(feature.properties.radius);
                            obj.setOptions(oCom.options.polygonOptions);
                            obj.type = "circle";
                            obj.id = oCom.options.shapeTempArr.length;
                            featureCollectionArray.push({
                                shape: obj,
                                type: google.maps.drawing.OverlayType.CIRCLE,
                                id: oCom.options.shapeTempArr.length
                            });
                        }


                        break;
                    case "polygon": //矩形， 多邊形                    
                        var polygonArr = [];
                        feature.geometry.coordinates.forEach(function(f) {
                            var ringArr = [];
                            f.forEach(function(p) {
                                var lat = p[1];
                                var lng = p[0];
                                ringArr.push({
                                    lat: lat,
                                    lng: lng
                                });
                            })
                            polygonArr.push(ringArr);
                        });
                        var obj = new google.maps.Polygon();
                        obj.setOptions(oCom.options.polygonOptions);
                        obj.setPaths(polygonArr);
                        obj.type = "polygon";
                        obj.id = oCom.options.shapeTempArr.length;
                        featureCollectionArray.push({
                            shape: obj,
                            type: google.maps.drawing.OverlayType.POLYGON,
                            id: oCom.options.shapeTempArr.length
                        });

                        break;
                    case "linestring": //線段
                        var polylineArr = [];
                        feature.geometry.coordinates.forEach(function(p) {
                            var lat = p[1];
                            var lng = p[0];
                            polylineArr.push({
                                lat: lat,
                                lng: lng
                            });
                        });

                        var obj = new google.maps.Polyline();
                        obj.setOptions(oCom.options.polylineOptions);
                        obj.setPath(polylineArr);
                        obj.type = "linestring";
                        obj.id = oCom.options.shapeTempArr.length;
                        featureCollectionArray.push({
                            shape: obj,
                            type: google.maps.drawing.OverlayType.POLYLINE,
                            id: oCom.options.shapeTempArr.length
                        });

                        break;
                }
            });
            featureCollectionArray.forEach(function(ele) {
                ele.shape.setMap(oCom.options.targetMap);
                if(!readonly)
                {
                    google.maps.event.addListener(ele.shape, 'click', function(e) {
                        oCom._setSelection(ele.shape);
                    });
                }
                oCom.options.shapeTempArr.push(ele);
            });


        },

        _getTargetMap: function() {
            var oCom = this;
            return oCom.options.targetMap;
        },

        _getInstance: function() {
            var oCom = this;
            return oCom.options.drawingManager;            
        },


        _unsubscribeEvents: function () {
            this.target.off('onInitComplete');            
        },
        _subscribeEvents: function () {
            //先解除所有事件接口
            this._unsubscribeEvents();

            //綁定初始化完成事件接口
            if (typeof (this.options.onInitComplete) === 'function') {
                this.target.on('onInitComplete', this.options.onInitComplete);
            }           
        }
    }

    //公開方法
    $.fn[pluginName] = function(options, args) {
        var drawingManager;
        this.each(function() {
            drawingManager = new DrawingManager($(this), options);
        });

        this.getInstance = function(){
            return drawingManager._getInstance();
        }
        this.getTargetMap = function(){
            return drawingManager._getTargetMap();
        }
        this.getGeoJsonData = function(){
            return drawingManager._getGeoJsonData();
        }
        this.addGeoJsonData = function(featureCollection){
            return drawingManager._addGeoJsonData(featureCollection);
        }
        return this;
    }

})(jQuery, window, document);

