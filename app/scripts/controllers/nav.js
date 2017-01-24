'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:NavCtrl
 * @description
 * # NavCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('NavCtrl', function($scope, $log, MenuSections, Utils, $q, TableColumns) {

	$scope.page = {
		menu: [],
		menuLoaded: false
	};

	$scope.loaded = false;

	$scope.oneAtATime = false;

	$scope.status = {
		isFirstOpen: true
	};

	var menu = [],
		i = 0,
		j = 0,
		k = 0;

	var getMenu = function() {
		menu = [];

		MenuSections.query({
			include: 'menu_items'
		}, function(success) {
			if (success.data) {
				for (i = 0; i < success.data.length; i++) {
					menu.push({
						name: success.data[i].attributes.name,
						path: success.data[i].attributes.admin_path,
						items: success.data[i].relationships.menu_items.data,
						icon: success.data[i].attributes.icon
					});
				}

				for (i = 0; i < menu.length; i++) {
					for (j = 0; j < menu[i].items.length; j++) {
						for (k = 0; k < success.included.length; k++) {
							if (success.included[k].type === 'menu_items') {
								if (menu[i].items[j].id === success.included[k].id) {
									menu[i].items[j].name = success.included[k].attributes.name;
									menu[i].items[j].path = success.included[k].attributes.admin_path;
								}
							}
						}
					}
				}
				Utils.setInStorage('collection_name', success.included[0].attributes.collection_name);

				$log.log('menu');
				$log.log(menu);
				$scope.page.menu = menu;
				$scope.page.menuLoaded = true;
			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error();
			if (error.status === 401) {
        		Utils.refreshToken(getMenu);
      		}
		});

	};

	var getColumns = function() {

		var defered = $q.defer();
		var promise = defered.promise;
		var columns = {};

		TableColumns.query({
			type: Utils.getInStorage('collection_name')
		}, function(success) {

			$log.log(success);

			columns.reportColumns = [];

			for (i = 0; i < success.data.length; i++) {
				columns.reportColumns.push({
					title: success.data[i].attributes.field_name,
					field: success.data[i].attributes.column_name,
					name: i,
					visible: true,
					relationshipName: success.data[i].attributes.relationship_name,
					dataType: success.data[i].attributes.data_type,
					filter: {}
				});
				columns.reportColumns[columns.reportColumns.length - 1].filter[success.data[i].attributes.field_name] = success.data[i].attributes.field_name;
			}

			Utils.setInStorage('report_columns', columns.reportColumns);

		}, function(error) {
			defered.reject({
				success: false,
				detail: error,
				data: ''
			});
		});

		return promise;
	};

	getMenu();
	getColumns();

});