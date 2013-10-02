function wktToGeoJSON(wkt) {
//convert well-known text to GeoJSON    
    var geometryType;
    
    //find substring left of first "(" occurrence
    switch(wkt.substr(0, wkt.indexOf("("))){
        case "POINT":
            geometryType = "Point";
            break;
        case "MULTIPOINT":
            geometryType = "MultiPoint";
            break;
        case "LINE":
            geometryType = "Line";
            break;
        case "MULTILINE":
            geometryType = "MultiLine";
            break;
        case "POLYGON":
            geometryType = "Polygon";
            break;
        case "MULTIPOLYGON":
            geometryType = "MultiPolygon";
            break;
        case "GEOMETRYCOLLECTION":
            geometryType = "GeometryCollection";
            break;
        default:
            //invalid wkt!
            return {};
    }
    //chop off geometry type, already have that
    var coordinates = wkt.substr(wkt.indexOf("("), wkt.length);
    //add extra [ and replace ( by [ 
    coordinates = "[" + coordinates.split("(").join("[");
    //replace ) by ] and add extra ]
    coordinates = coordinates.split(")").join("]") + "]";
    //replace , by ],[
    coordinates = coordinates.split(",").join("],[");
    //replace spaces with ,
    coordinates = coordinates.split(" ").join(",");

    return {
        "type": "Feature",
        "geometry": {
            "type": geometryType,
            "coordinates": eval('(' + coordinates + ')')
            },
        //todo: construct properties from sparql+json
        "properties": {}
    };
}

function sparqlToGeoJSON(sparqlJSON) {
    var geojson = {
        "type": "FeatureCollection",
            "features": []
    };
    
    for (var bindingindex = 0; bindingindex < sparqlJSON.results.bindings.length; ++bindingindex) {
        for (var varindex = 0; varindex < sparqlJSON.head.vars.length; ++varindex) {
            if (sparqlJSON.results.bindings[bindingindex][sparqlJSON.head.vars[varindex]].datatype == "http://www.opengis.net/ont/geosparql#wktLiteral") {
                //assumes the well-known text is valid!
                geojson.features.push(wktToGeoJSON(sparqlJSON.results.bindings[bindingindex][sparqlJSON.head.vars[varindex]].value));
            }
        }
    }
    return geojson;
}