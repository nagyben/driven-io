var app = angular.module('driven-io', ['ui.router', 'ngMap', 'btford.socket-io']);
app.run(function($rootScope) {
  $rootScope.$on("$stateChangeError", console.log.bind(console));
});

app.factory('socket', function (socketFactory) {
  return socketFactory();
});