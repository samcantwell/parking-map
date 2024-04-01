var map = L.map('map').setView([-37.91895, 145.08918], 19);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 22,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var points = [
    [-37.91895, 145.08918],
    [-37.918, 145.089],
];

drawParkingSection(points);

function createLine(points) {
    L.polyline(points, {color: 'blue'}).addTo(map);	
}


function getHeading(coord1, coord2) {
    const lat1 = coord1.lat;
    const lat2 = coord2.lat;
    const lon1 = coord1.lng;
    const lon2 = coord2.lng;
//    const dl = lon2 - lon1;
//    return Math.atan2(Math.sin(dl) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dl));
//
    const y = Math.sin(lon2-lon1) * Math.cos(lat2);
    const x = Math.cos(lat1)*Math.sin(lat2) -
              Math.sin(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1);
    const theta = Math.atan2(y, x);
    //const brng = (theta*180/Math.PI + 360) % 360; // in degrees
    return theta;
}

function directionPoint(point, direction, distance) {
    const coord = L.latLng(point);
    const lat1 = Math.PI*coord.lat/180;
    const lon1 = Math.PI*coord.lng/180;    
    const R = 6371000;

    const lat2 = 180 * Math.asin( Math.sin(lat1)*Math.cos(distance/R) + Math.cos(lat1)*Math.sin(distance/R)*Math.cos(direction) ) / Math.PI;
    const lon2 = 180 * (lon1 + Math.atan2(Math.sin(direction)*Math.sin(distance/R)*Math.cos(lat1), Math.cos(distance/R)-Math.sin(lat1)*Math.sin(lat2))) / Math.PI;
    
    //console.log(Math.sin(lat1), Math.cos(distance/R), Math.cos(lat1), Math.sin(distance/R), Math.cos(direction))
    console.log("DirLen: ", lat1, lon1, R, distance/R, lat2, lon2);

    return L.latLng(lat2, lon2);
}

function drawParkingSection(points, parkingType) {
    const minParkingLength = 5.4;
    const parkingWidth = 2.5;

    var totalDistance = 0;
    var prevPoint = L.latLng(points[0]);
    for (point of points) {
        var coord = L.latLng(point)
        totalDistance += prevPoint.distanceTo(coord);
        prevPoint = coord;
    }
    
    //console.log(totalDistance);

    if (totalDistance < minParkingLength) {
        return;
    }

    //console.log(heading(L.latLng(points[0]), L.latLng(points[1])));
    createLine(points);

    var prevPoint = L.latLng(points[0]);
    for (point of points.slice(1, points.length)) {
        var coord = L.latLng(point);
        console.log(prevPoint, coord, point);
        const heading = getHeading(coord, prevPoint);
    
        var distRemaining = totalDistance;
        var parkingCount = 0;
        const parkingLength = minParkingLength;

        prevCoord = coord;
        while (distRemaining >= minParkingLength) {
            a = prevCoord;
//            console.log(directionPoint(point, heading, parkingLength * parkingCount), coord, prevPoint, a);
            b = directionPoint(a, heading, parkingLength);
            c = directionPoint(b, heading + Math.PI/2, parkingWidth);
            d = directionPoint(a, heading + Math.PI/2, parkingWidth);

            console.log(L.polygon([a, b, c, d], {color: 'red'}).addTo(map));
            parkingCount += 1;
            distRemaining -= parkingLength;
            prevCoord = b;
        }

        prevPoint = coord;
    }    
}

function closestCoordOnSegment(c, c1, c2) {
    console.log("c12: ", c, c1,c2);
    let y = c1.lat,
        x = c1.lng,
        dx = c2.lng - x,
        dy = c2.lat - y,
        t;
    const dot = dx * dx + dy * dy;
    console.log(dot);
    
    if (dot > 0) {
    	t = ((c.lng - x) * dx + (c.lat - y) * dy) / dot;
        console.log("t: ", t);
    
    	if (t > 1) {
    		x = c2.lng;
    		y = c2.lat;
    	} else if (t > 0) {
    		x += dx * t;
    		y += dy * t;
    	}
    }
    
    dx = c.lng - x;
    dy = c.lon - y;
    
    return L.latLng(x, y);
}
