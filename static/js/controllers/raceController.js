/* HIGHCHARTS */
var volts_chart;
var volts_series;

var amps_chart;
var amps_series;

var rpm_chart;
var rpm_series;

var speed_chart;
var speed_series;

var map;
var marker;
var infowindow;

var cur_spd = 0;



angular.module('driven-io')
	.controller('raceController', function($rootScope, $scope, $stateParams, $http, $timeout, NgMap, socket) {
		var map;
	
		$scope.lat = 52.1909647;
		$scope.lon = -1.4833891;
	
		$scope.showVolts = true;
		$scope.showAmps = true;
		$scope.showRPM = true;
		$scope.showSpeed = true;
	
		$scope.volts = 0;
		$scope.amps = 0;
		$scope.rpm = 0;
		$scope.speedMPS = 0;
		$scope.ampHours = 0;
		$scope.wattHoursPerKM = 0;
		$scope.gearRatio = 0;
		$scope.temp1 = 0;

		NgMap.getMap().then(function(map) {
			map = map;
			console.log(map.getCenter());
			console.log('markers', map.markers);
			console.log('shapes', map.shapes);
		});

		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options) {
			socket.emit('unsubscribe', $stateParams.room);
		});

		$scope.init = function() {
			if ($stateParams.room != null) {
				$scope.roomName = $stateParams.room;
				InitializeVoltsChart();
				InitializeAmpsChart();
				InitializeRPMChart();
				InitializeSpeedChart();
				socket.emit('subscribe', $stateParams.room);
			}
		};

		$scope.$on('$destroy', function() {
			socket.emit('unsubscribe', $stateParams.room);
			socket.disconnect();
		});

		socket.on('telemetry', function(msg) {
			msg = ab2str(msg);
			if (msg.search("lon") !== -1) {
				// location info
				HandleLocation(msg);
			} else {
				// telemetry
				msg = JSON.parse(msg);
				console.log(msg);
				volts_series.addPoint([Date.now(), msg.v]);
				amps_series.addPoint([Date.now(), msg.a]);
				rpm_series.addPoint([Date.now(), msg.m]);
				speed_series.addPoint([Date.now(), msg.s * 2.26]);
				
				$scope.volts = msg.v;
				$scope.amps = msg.a;
				$scope.rpm = msg.m;
				$scope.speedMPS = cur_spd = msg.s;
				$scope.ampHours = msg.ah;
				$scope.wattHoursPerKM = msg.w;
				$scope.gearRatio = msg.gr;
				$scope.temp1 = msg.t1;
			}
		});
	
		function ab2str(buf) {
			return String.fromCharCode.apply(null, new Uint8Array(buf));
		}
		
		function HandleLocation(str) {
			locJSON = JSON.parse(str);
			$scope.lat = locJSON.lat;
			$scope.lon = locJSON.lon;
		}
	
		$scope.reflowCharts = function() {
			volts_chart.reflow();
			amps_chart.reflow();
			rpm_chart.reflow();
			speed_chart.reflow();
		}
	});

function InitializeVoltsChart() {

	volts_chart = new Highcharts.Chart({
		chart: {renderTo: 'volts_graph',type: 'line',	animation: false	},
		legend: {	enabled: false},
		tooltip: {valueDecimals: 2,	valueSuffix: 'V'},
		title:  { enabled: false, text: null},
		xAxis: { type: 'datetime'},
		yAxis: { title: { text: 'Volts'}, min: 0,	max: 30	},
		series: [{id: 'volts',	name: 'Volts'	}],
		plotOptions: {	series: {	color: '#9F6FBD'	}	},
		credits: {enabled: false} });
	volts_series = volts_chart.get('volts');
}

function InitializeAmpsChart() {
	amps_chart = new Highcharts.Chart({
		chart: {renderTo: 'amps_graph',type: 'line',animation: false},
		legend: {	enabled: false},
		tooltip: {		valueDecimals: 2,		valueSuffix: 'A'	},
		title: {	enabled: false, text: null},
		xAxis: {	type: 'datetime'},
		yAxis: {title: { text: 'Amps'}, min: 0,	max: 100,	plotBands: [{	color: '#FCE3E3',	from: 50,	to: 100	}, {color: '#ffeded',	from: 30,	to: 50}]},
		series: [{id: 'amps',	name: 'Amps'}],
		plotOptions: {	series: {	color: '#3285C9'}	},
		credits: {enabled: false}	});
	amps_series = amps_chart.get('amps');
}

function InitializeRPMChart() {
	rpm_chart = new Highcharts.Chart({
		chart: {	renderTo: 'rpm_graph',type: 'line',	animation: false},
		legend: {	enabled: false},
		tooltip: {	valueDecimals: 0,		valueSuffix: 'RPM'	},	
		title: {	enabled: false, text: null	},
		xAxis: {	type: 'datetime'},
		yAxis: {title: { text: 'RPM'},	min: 0,	max: 2300	},
		series: [{	id: 'rpm',	name: 'RPM'	}],
		plotOptions: {	series: {	color: '#404040'} },
		credits: {enabled: false}	});
	rpm_series = rpm_chart.get('rpm');
}

function InitializeSpeedChart() {
	speed_chart = new Highcharts.Chart({
		chart: {	renderTo: 'speed_graph',	type: 'line',	animation: false	},
		legend: {	enabled: false},tooltip: {	valueDecimals: 1,	valueSuffix: 'mph'	},
		title: {	enabled: false, text: null	},
		xAxis: {	type: 'datetime'	},
		yAxis: {title: { text: 'Speed (mph)'},	min: 0,	max: 50	},
		series: [{id: 'speed',name: 'Speed'	}],
		plotOptions: {	series: {	color: '#F26666'	}	},
		credits: {enabled: false} });
	speed_series = speed_chart.get('speed');
}

function initMap() {
	// Create a map object and specify the DOM element for display.
	map = new google.maps.Map(document.getElementById('googlemap'), {
		center: {
			lat: 52.1939752,
			lng: -1.4866305
		},
		scrollwheel: true,
		zoom: 14
	});
}