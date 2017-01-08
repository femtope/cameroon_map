var cameroonAdm1,
    cameroon_district = null, cameroon_area = null,
    areaLabel = [],
    districtAdmin = false, areaAdmin = false

var map = L.map('map', {
    center: [7, 10],
    zoom: 6,
    animation: true,
    zoomControl: false
});

var infoAdmin = L.control();
infoAdmin.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

infoAdmin.update = function (props) {
    this._div.innerHTML = '<h4></h4>' +  (props?
			'<b>' + props.adm1_name + '</b><br />' +'' : '    ');
	};

infoAdmin.addTo(map);


var infoDistrict = L.control();
infoDistrict.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

infoDistrict.update = function (props) {
    this._div.innerHTML = '<h4></h4>' +  (props?
			'<b>' + props.hlth_district_name + '</b><br />' +'' : '    ');
	};

infoDistrict.addTo(map);

map.on('zoomend', function () {
    adjustLayerbyZoom(map.getZoom())
})

new L.Control.Zoom({
    position: 'topright'
}).addTo(map);

function adjustLayerbyZoom(zoomDistrict) {

    if (zoomDistrict > 7 && zoomDistrict <= 11) {
        if (!districtAdmin) {
            map.addLayer(cameroon_district);
            cameroon_district.bringToFront();
            cameroonAdm1.bringToBack();

            districtAdmin = true
        }
    } else {
        map.removeLayer(cameroon_district)
        districtAdmin = false
    }

     if (zoomDistrict > 8) {
        if (!areaAdmin) {
            map.addLayer(cameroon_area);
            cameroon_area.bringToFront();
            cameroon_district.bringToBack();
            cameroonAdm1.bringToBack();
            for (var i = 0; i < areaLabel.length; i++) {
                areaLabel[i].addTo(map)
            }
            areaAdmin = true
        }
    } else {
        map.removeLayer(cameroon_area)
        for (var i = 0; i < areaLabel.length; i++) {
            map.removeLayer(areaLabel[i])
        }
        areaAdmin = false
    }
}

function zoomToFeatureAdmin(e) {
    map.fitBounds(e.target.getBounds());
    console.log("Zoom Level:  "+map.getZoom());
    cameroonAdm1.bringToBack();
}

function highlightFeatureAdmin(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#B2BEB5',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    }

    infoAdmin.update(layer.feature.properties);
}


function resetHighlightAdmin(e) {
    cameroonAdm1.resetStyle(e.target);
    infoAdmin.update();
}

function zoomToFeatureDistrict(e) {
    map.fitBounds(e.target.getBounds());
    console.log("Zoom Level:  "+map.getZoom());
    cameroonAdm1.bringToBack();
}

function highlightFeatureDistrict(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#BBB3B1',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    infoDistrict.update(layer.feature.properties);
}

function resetHighlightDistrict(e) {
    cameroon_district.resetStyle(e.target);
    infoDistrict.update();
}

function zoomToFeatureArea(e) {
    map.fitBounds(e.target.getBounds());
    console.log("Zoom Level:  "+map.getZoom());
    cameroonAdm1.bringToBack();
}

function highlightFeatureArea(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#BBB3B1',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    infoDistrict.update(layer.feature.properties);
}

function resetHighlightArea(e) {
    cameroon_area.resetStyle(e.target);
    infoDistrict.update();
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
getAdminLayers()
hideLoader()
