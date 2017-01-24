'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:PagesSearchResultsCtrl
 * @description
 * # PagesSearchResultsCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')
  .controller('SearchResultsCtrl', function ($scope) {
    $scope.page = {
      title: 'Search Results',
      subtitle: 'Place subtitle here...'
    };
  });
