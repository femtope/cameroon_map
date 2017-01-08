var type = '', distance,
    twokm, threekm, fourkm,
    region = '',
    prefecture = '', prefecture_select = '',
    sub_prefecture = '', current_lat = '', current_long = '', current_accuracy = '',
    positionOpt = {},
    geoData = null,
    dataLayer = null,
    markerGroup = null,
    cameroonAdm1,
    prefecture_layer = null, sub_prefecture_layer = null, bufferLayer = null,
    cameroon_district = null, cameroon_area = null,
    areaLabel = [], testLabels = [],
    within, within_fc, buffered = null,
    districtAdmin = false, areaAdmin = false,
    googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']}),
    googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']}),
    terrain = googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{maxZoom: 20, subdomains:['mt0','mt1','mt2','mt3']}),
    osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20}),
    mapbox = L.tileLayer('https://maps.nlp.nokia.com/maptiler/v2/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?lg=eng&token=61YWYROufLu_f8ylE0vn0Q&app_id=qIWDkliFCtLntLma2e6O', {maxZoom: 20})


var map = L.map('map', {
    center: [7, 9],
    zoom: 16,
    animation: true,
    zoomControl: false,
    layers: [googleSat]
    //minZoom: 6

});


var baseMaps = {
    "Google Satelite": googleSat,
    "Google Street": googleStreets,
    "Terrain": terrain,
    "MapBox": mapbox,
    "OSM": osm
};



map.on('zoomend', function () {
    adjustLayerbyZoom(map.getZoom())
})


new L.Control.Zoom({
    position: 'topright'
}).addTo(map);

L.control.layers(baseMaps).addTo(map);


L.control.scale({
    position: 'bottomright',
    maxWidth: 100,
    metric: true,
    updateWhenIdle: true
}).addTo(map);


function triggerUiUpdate() {
    type = $('#hf_type').val()
    region = $('#region_scope').val()
    prefecture = $('#prefecture_scope').val()
    var query = buildQuery(type, region, prefecture, sub_prefecture)
    getData(query)
    prefecture_select = $('#region_scope').val()
}



function buildQuery(type, region, prefecture, sub_prefecture) {
  var needsAnd = false;
    query = 'http://femtope.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM guinea_hf';
   if (type.length > 0 || region.length > 0 || prefecture.length > 0 || sub_prefecture.length > 0){
       query = query.concat(' WHERE')
       if (type.length > 0){
      query = query.concat(" type = '".concat(type.concat("'")))
      needsAnd = true
    }

    if (region.length > 0){
      query = needsAnd  ? query.concat(" AND region = '".concat(region.concat("'"))) :  query.concat(" region = '".concat(region.concat("'")))
      needsAnd = true
    }

    if(prefecture.length > 0) {
      query = needsAnd  ? query.concat(" AND prefecture = '".concat(prefecture.concat("'"))) :  query.concat(" prefecture = '".concat(prefecture.concat("'")))
      needsAnd = true
    }

    if(sub_prefecture.length > 0) {
      query = needsAnd  ? query.concat(" AND sub_prefecture = '".concat(sub_prefecture.concat("'"))) :  query.concat(" sub_prefecture = '".concat(sub_prefecture.concat("'")))
      needsAnd = true
    }

   }
     else query = 'http://femtope.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM guinea_hf';
  return query

}



function addDataToMap(geoData) {
    // adjustLayerbyZoom(map.getZoom())
    //remove all layers first

    if (dataLayer != null)
        map.removeLayer(dataLayer)

    if (markerGroup != null)
        map.removeLayer(markerGroup)

    var _radius = 8
    var _outColor = "#fff"
    var _weight = 2
    var _opacity = 2
    var _fillOpacity = 2.0

    var markerHealth = L.icon({
        iconUrl: "image/Hospital_Logo_01.png",
        iconSize: [20, 20],
        iconAnchor: [25, 25]
    });



    $('#projectCount').text(geoData.features.length)

    markerGroup = L.markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            removeOutsideVisibleBounds: true
        })
        dataLayer = L.geoJson(geoData, {
        pointToLayer: function (feature, latlng) {
            var marker = L.marker(latlng, {icon: markerHealth})
                //markerGroup.addLayer(marker);
            return marker
        },
        onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.cartodb_id) {
                //layer.bindPopup(buildPopupContent(feature));
                layer.on('click', function () {
                    displayInfo(feature)
                })
            }

        }

    })

    markerGroup.addLayer(dataLayer);
    map.addLayer(markerGroup);
}

function adjustLayerbyZoom(zoomDistrict) {

}




function zoomToFeatureAdmin(e) {
    map.fitBounds(e.target.getBounds());
    console.log("Zoom Level:  "+map.getZoom());
    cameroonAdm1.bringToBack();
}


function addAdminLayersToMap(layers) {
    var layerStyles = {
            'admin1': {
                "clickable": true,
                "color": '#FFFFFF',
                "fillColor": '#B2BEB5',
                "weight": 1.5,
                "opacity": 1.5,
                "fillOpacity": 1
            },
            'district': {
                "clickable": true,
                "color": '#FFFFFF',
                "fillColor": '#BBB3B1',
                "weight": 1.5,
                "opacity": 1.5,
                "fillOpacity": 1
            },
            'area': {
                "clickable": true,
                "color": '#FFFFFF',
                "fillColor": '#BBB3B1',
                "weight": 1.5,
                "opacity": 1.5,
                "fillOpacity": 1
            }
      }

    cameroonAdm1 = L.geoJson(layers['camAdmin1'], {
        style: layerStyles['admin1'],
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseover: highlightFeatureAdmin,
                mouseout: resetHighlightAdmin,
                click: zoomToFeatureAdmin
            })
        }
    }).addTo(map)

    //Zoom In to Area Level

    if(cameroon_area != null)
        map.removeLayer(cameroon_area)

    cameroon_area = L.geoJson(layers['camArea'], {
        style: layerStyles['area'],
        onEachFeature: function (feature, layer) {
            var labelIcon = L.divIcon({
                className: 'labelLga-icon',
                html: feature.properties.hlth_area_name
            })
            areaLabel.push(L.marker(layer.getBounds().getCenter(), {
                    icon: labelIcon
                }));

            layer.on({
                mouseover: highlightFeatureArea,
                mouseout: resetHighlightArea,
                click: zoomToFeatureArea
            })
              }
    })

    //Zoom In to District level
    if(cameroon_district != null)
      map.removeLayer(cameroon_district)

    cameroon_district = L.geoJson(layers['camDistrict'], {
        style: layerStyles['district'],
        onEachFeature: function(feature, layer) {
            layer.on({
                mouseover: highlightFeatureDistrict,
                mouseout: resetHighlightDistrict,
                click: zoomToFeatureDistrict
            })
        }
      })
}



function showLoader() {
    $('.fa-spinner').addClass('fa-spin')
    $('.fa-spinner').show()
}

function hideLoader() {
    $('.fa-spinner').removeClass('fa-spin')
    $('.fa-spinner').hide()
}


function getData(queryUrl) {
    showLoader()
    $.post(queryUrl, function (data) {
        hideLoader()
        addDataToMap(data)
        console.log('Data-Geo::  ', data);
    }).fail(function () {
        console.log("error!")
    });
}

function getAdminLayers() {
    showLoader()
    var adminLayers = {}

    //Add Admin Layers to Map


     $.get('resources/admin_area.geojson', function (cam_area) {
        adminLayers['camArea'] = JSON.parse(cam_area)
        addAdminLayersToMap(adminLayers)
		}).fail(function () {
            logError(null)
        })


    $.get('resources/admin_district.geojson', function (cam_district) {
        adminLayers['camDistrict'] = JSON.parse(cam_district)
        addAdminLayersToMap(adminLayers)
		}).fail(function () {
            logError(null)
        })


    $.get('resources/cameroon_admin1.geojson', function (cam_admin1) {
        adminLayers['camAdmin1'] = JSON.parse(cam_admin1)
        addAdminLayersToMap(adminLayers)
		}).fail(function () {
            logError(null)
        })
}

function logError(error) {
    console.log("error!")
}




//Filtering Prefecture Based on Selected Region
$(document).ready(function () {
    var allOptions = $('#prefecture_scope option')
    $('#region_scope').change(function () {
        $('#prefecture_scope option').remove()
        var classN = $('#region_scope option:selected').prop('class');
        var opts = allOptions.filter('.' + classN);
        $.each(opts, function (i, j) {
            $(j).appendTo('#prefecture_scope');
        });
    });
});



getAdminLayers()
hideLoader()
