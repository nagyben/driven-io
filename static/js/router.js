angular.module('driven-io')
	.config(function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise("/");

		$stateProvider
			.state('main', {
				url: '/',
				views: {
					'header': {
						templateUrl: "/parts/welcome-header.html"
					},
					'main': {
						templateUrl: "/parts/rooms.html"
					},
					'footer': {
						templateUrl: "/parts/footer.html"
					}
				}
			})
			.state('room', {
				url: '/rooms/:room',
				views: {
					'header': {
						templateUrl: "/parts/race-header.html"
					},
					'main': {
						templateUrl: "/parts/race.html"
					},
					'footer': {
						templateUrl: "/parts/race-footer.html"
					}
				}
			})
	});