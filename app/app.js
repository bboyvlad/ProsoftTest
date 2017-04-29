'use strict';

// Declare app level module which depends on views, and components
angular.module('proTest', [
  'ngRoute',
  'proTest.view1',
  'proTest.calendar'
]).
config(['$locationProvider', '$routeProvider', '$httpProvider', function($locationProvider, $routeProvider, $httpProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});

}]);