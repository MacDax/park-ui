var map, places, infoWindow;
var markers = [];
var autocomplete;
var countryRestrict = {'country': 'us'};
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';


function initMap() {
	var mapProp= {
   	 center:{lat: 37.7793, lng: -122.4193},
   	 zoom:16,
	};

	map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
	/*google.maps.event.addListener(map, 'click', function(event) {
			map.panTo(event.latLng);
		});*/
	
	autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */ (
                document.getElementById('autocomplete')), {
            	/*types: ['(street)'],
                componentRestrictions: countryRestrict*/
            });
	
	places = new google.maps.places.PlacesService(map);

    autocomplete.addListener('place_changed', onPlaceChanged);
    infoWindow = new google.maps.InfoWindow;

 // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        geocodeLatLng(map, infoWindow, pos);
        
        infoWindow.setPosition(pos);
        //infoWindow.setContent('Location found.');
        infoWindow.open(map);
        map.setCenter(pos);
      }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
  }

function geocodeLatLng(map, infoWindow, pos) {
	var geocoder = new google.maps.Geocoder;
	geocoder.geocode({'location' : pos}, function(results, status) {
		if(status === 'OK') {
			if(results[0]) {
				map.setZoom(11);
				var marker = new google.maps.Marker({
					position: pos,
					map: map
				});
				infoWindow.setContent(results[0].formatted_address);
				infoWindow.open(map, marker);
				//callStreetSweepAPI(results[0].formatted_address); //call StreeSweep API passing geocode location
			}else {
				console.log('No results found');
			}
		}else {
			console.log('Geocoder failed due to ' + status);
		}
	});
}

function onPlaceChanged() {
    var place = autocomplete.getPlace();
    if (place.geometry) {
      map.panTo(place.geometry.location);
      map.setZoom(16);
      placeDetails(place.geometry.location, place);
      createMarker(place);
    } else {
      document.getElementById('autocomplete').placeholder = 'Enter an address';
    }
  }

function placeDetails(latLng, place) {
	var service = new google.maps.places.PlacesService(map);
	var request = { 
			location: latLng,
			radius: '100',
	};
	
	var placeRequest={ reference : place.reference};
	service.getDetails(placeRequest, function(details, status) {
		if(status == google.maps.places.PlacesServiceStatus.OK) {
			console.log("fmt addr " + details.formatted_address);
			callStreetSweepAPI(details.formatted_address);
		}
	});
	
	service.nearbySearch(request,
		function(results, status) {
		if(status == google.maps.places.PlacesServiceStatus.OK) {
	        //createMarker(results[0]);
			//callStreetSweepAPI(results[0]);
		}
	});
	
}

var street = function(address) {
	var st = address.split(" ");
	var cityIndex = address.indexOf("San Francisco");
	console.log("cit y index " + cityIndex);
	//var streetName = st[1] +" " + st[2].substring(0, st[2].indexOf(","));
	var streetAddr = address.substring(0, cityIndex);
	var streetName = streetAddr.substr(streetAddr.indexOf(" ")+1);
	streetName = streetName.substring(0, streetName.indexOf(","));
	console.log("streetname " + streetName);
	return streetName.toUpperCase();
}

var addressNumber = function(address) {
	var st = address.split(" ");
	var streetNumber = st[0];
	return streetNumber;
}

function callStreetSweepAPI(place) {
	var streetName = street(place);
	//console.log("st " + streetName);
	$.ajax({
		url:"https://data.sfgov.org/resource/u2ac-gv9v.json?streetname="+streetName,
		type:"GET",
		data: {
			"$limit" : 1000,
			"$$app_token" : "O5TnGmseY4pSgdwVgAO6ctKgm"
		}
	}).done(function(data) {
		//console.log("ken " + data.length + " " + data);
		showSchedule(data, place);
	});
}

function showSchedule(data, place) {
	var stNumber = addressNumber(place);
	var stNo = parseInt(stNumber);
	var msgString;
	var blockData = [];
	for(var i=0; i<data.length;i++) {
		if(stNo % 2 == 0) {
			if(data[i].rt_fadd <= stNo && data[i].rt_toadd >= stNo) {
				blockData.push(data[i]);
			}
		}else {
			if(data[i].lf_fadd <= stNo && data[i].lf_toadd >= stNo) {
				blockData.push(data[i]);
			}
		}
	}
	showScheduleData(blockData);
	
	/*var meterPath = new google.maps.Polyline({
		path: location,
		geodesic: true,
		strokeColor: "#FF0000",
		strokeOpacity: 1.0,
		strokeWeight: 2
	});
	meterPath.setMap(map);*/
	
}

function showScheduleData(fileteredData) {
	$("#schedule").empty();
	var msgString;
	console.log(fileteredData.length);
	for(var i=0; i<fileteredData.length; i++) {
		var scheduleDiv = $("<div class='panel-body' style:'width: 280px;' font-color:'black'></div>");
		msgString = "<b>Street : </b>" + fileteredData[i].streetname + "<b> Block Side : </b>" + fileteredData[i].blockside +  "</br>"
		+ "<b> NeighborHood : </b>" + fileteredData[i].nhood  + "<b> From : </b>" + fileteredData[i].fromhour  + "<b> To  : </b>" + fileteredData[i].tohour +
		 "<b> Weekday : </b>" + fileteredData[i].weekday;
		var week1 = fileteredData[i].week1ofmon;
		var week2 = fileteredData[i].week2ofmon;
		var week3 = fileteredData[i].week3ofmon;
		var week4 = fileteredData[i].week4ofmon;
		var week5 = fileteredData[i].week5ofmon;
		var scheduleweeks = [week1, week2, week3, week4, week5];
		var weekday = weekDay(fileteredData[i].weekday);
		var nextSweepDate = nextDate(weekday);
		//console.log("nextSweepDateTime : " + nextSweepDate);
		var frmHour = fileteredData[i].fromhour;
		//console.log("frmHour " + frmHour);
		var frmAry = formattedHour(frmHour);
		//console.log("frmAry : " + frmAry);
		var nextSweepDateTime = new Date(nextSweepDate.getFullYear(), nextSweepDate.getMonth(), nextSweepDate.getDate(), frmAry, "00", "00");
		console.log("nextSweepDateTime : " + nextSweepDateTime);
		var nextSweepScheduleMsg = "Msg";
		var street = fileteredData[i].streetname;
		var day = fileteredData[i].weekday;
		var from = fileteredData[i].fromhour; 
		var to = fileteredData[i].tohour;
		scheduleDiv.on("click", {st: street, nextDate:nextSweepDateTime, nextSchedule:nextSweepScheduleMsg}, showClock);
		scheduleDiv.html(msgString);
		$("#schedule").append(scheduleDiv);
	}
}


function selectedParkingLocation(event) {
	var timeDiffDiv = $("<div class='panel-body' style:'width: 280px;' font-color:'black'></div>");
	var nextDate = new Date(event.data.nextDate);
	var msg = "Street : " + event.data.st;
	timeDiffDiv.html(msg);
	$("#schedule").append(timeDiffDiv);
	showClock(nextDate);
}

var nextDate = function(x) {
	var now = new Date();
	now.setDate(now.getDate() + (x + (7-now.getDay())) % 7);
	return now;
}

var formattedHour = function(hour) {
	var hours = hour.split(":");
	var fmtHour = 0;
	var intHr = parseInt(hours[0]);
	//console.log("intHr : " + intHr);
	if(parseInt(intHr) >= 0 && parseInt(intHr) < 12) {
		fmtHour = parseInt(intHr) + 12;
	}
	if(parseInt(intHr) >=12 && parseInt(intHr) <=23) {
		fmtHour = parseInt(intHr) - 12;
	}
	return fmtHour;
}

var weekDay = function(day) {
	var weekday = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Satur"];
	for(var i=0; i<weekday.length; i++) {
		if(day === weekday[i]) {
			return i;
		}
	}
	return 0;
}

/*function showClock(event) {
	$("#schedule").empty();
	var msgString = "Your parking spot street is : " + event.data.street;
	//msgString = msgString + " Sweeping schedule is on : " + event.data.wkday + " From : " + event.data.fromHr + " To : " + event.data.toHr;
	$("#schedule").html(msgString);
	var start = new Date;
	var timerDiv = $("<div class='panel-body' style:'width: 280px;' font-color:'black'></div>");
	var nextDate = new Date(event.data.nextDate);
	setInterval(function() {
		 var total_seconds = (new Date - start) / 1000;   

		  var hours = Math.floor(total_seconds / 3600);
		  total_seconds = total_seconds % 3600;

		  var minutes = Math.floor(total_seconds / 60);
		  total_seconds = total_seconds % 60;

		  var seconds = Math.floor(total_seconds);

		  hours = pretty_time_string(hours);
		  minutes = pretty_time_string(minutes);
		  seconds = pretty_time_string(seconds);

		  var currentTimeString = hours + ":" + minutes + ":" + seconds;

		  $(timerDiv).text(currentTimeString);
	}, 1000);
	$("#schedule").append(timerDiv);
}


function pretty_time_string(num) {
	return (num <10 ? "0" : "") + num;
}*/

function showClock(event) {
	var msgString = "Your parking spot street is : " + event.data.st + "</br>" + " Next sweep date is : " + event.data.nextDate;
	msgString = msgString + "</br>" + " Sweeping will start in next : " + "</br>";
	$("#schedule").html(msgString);
	var countDownDate = new Date(event.data.nextDate);
	var timeDiffDiv = $("<div class='panel-body' style:'width: 280px;' font-color:'black'></div>");
	 $("#schedule").append(timeDiffDiv);
var timer = setInterval(function() {
		
	  // Get todays date and time
	  var now = new Date().getTime();

	  // Find the distance between now an the count down date
	  var distance = countDownDate - now;

	  // Time calculations for days, hours, minutes and seconds
	  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
	  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

	  var time = days + "d " + hours + "h "
	  + minutes + "m " + seconds + "s ";
	  
	  timeDiffDiv.html(time);
	 
	  // If the count down is finished, write some text 
	  if (distance < 0) {
	    clearInterval(x);
	    document.getElementById("schedule").innerHTML = "EXPIRED";
	  }
	}, 1000);
	//$("#schedule").append(timeDiffDiv);
}

function createMarker(place) {
	var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function() {
     infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
              'Place ID: ' + place.place_id + '<br>' +
              place.formatted_address + '</div>');
      infowindow.open(map, this);
    });
   
  }

