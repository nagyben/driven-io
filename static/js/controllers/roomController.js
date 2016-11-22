var UPDATE_INTERVAL = 5000;
angular.module('driven-io')
.controller('roomController', function($scope, $stateParams, $http, $interval) {
	$scope.rooms = [];
	
	var getRooms = function getRooms() {
		$http.get('http://exantas.me:8585/api/rooms').then(
			function success(data) {
// 				console.log(data);
				$scope.rooms = [];
				for (key in data.data) {
					var obj = {name: key, viewers: data.data[key].viewers};
					$scope.rooms.push(obj);
				}
				console.log($scope.rooms);
			},
			function error(data) {
				console.log(data);
			}
		)
	}
	
	getRooms();
	$interval(getRooms, UPDATE_INTERVAL);
});