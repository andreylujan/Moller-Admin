'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:PagesLoginCtrl
 * @description
 * # PagesLoginCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('LoginCtrl', function($scope, MenuSections, TableColumns, $state, $q, $log, $auth, Login, Users, Utils) {

	$scope.page = {
		user: {
			username: '',
			password: ''
		}
	};

	$scope.elements = {
		msg: {
			show: '',
			text: ''
		}
	};

	var menu = [],
		i = 0,
		j = 0,
		k = 0;

	var i = 0;

	$scope.login = function() {

		$auth.login({
				username: $scope.page.user.username,
				password: $scope.page.user.password,
				grant_type: "password"
			})
			.then(function(success) {
				Utils.setInStorage('logged', true);
				Utils.setInStorage('refresh_t', success.data.data.attributes.refresh_token);
				Utils.setInStorage('role_id', success.data.data.relationships.role.data.id);
				Utils.setInStorage('idUser', success.data.data.relationships.user.data.id);

				$auth.setToken(success.data.data.attributes.access_token);

				if ($auth.getToken() !== null) 
				{
					getUserData(success.data.data.relationships.user.data.id)
						.then(function(data) {
							Utils.setInStorage('fullName', data.data.fullName);
							Utils.setInStorage('image', data.data.image);
							Utils.setInStorage('is_superuser', data.data.is_superuser);
							Utils.setInStorage('role_type', data.data.role_type);

							getMenu();
							getColumns();
						})
						.catch(function(error) {
							$log.error(error);
							if (!error.success) {

								if (error.detail.status === 404) {
									$scope.elements.msg.text = 'Error al cargar datos de usuario, vuelva a logear';
									$scope.elements.msg.show = true;
								} 
								else if (error.detail.status === 401)
								{
									$scope.elements.msg.text = 'Error al cargar datos de usuario, vuelva a logear';
									$scope.elements.msg.show = true;
								}
								else {
									$scope.elements.msg.text = error.detail.data.errors[0].detail;
									$scope.elements.msg.show = true;
								}
							}
						});
				}
				else
				{
					$state.go('login');
				}
			})
			.catch(function(error) {
				$log.error(error);
				if (error.status === 401) 
				{
					$scope.elements.msg.text = 'Usuario y/o contraseña invalida. Intente nuevamente';
					$scope.elements.msg.show = true;
				}
			});

	};

	

	var getUserData = function(idUser) {

		var defered = $q.defer();
		var promise = defered.promise;
		var user = {};

		Users.query({
			idUser: idUser,
			include: 'role.organization.report_types.sections.data_parts.collection.collection_items,role.organization.report_types.sections,role.organization.roles'
		}, function(success) {

			user.fullName = success.data.attributes.full_name;
			user.image = success.data.attributes.image;
			user.type = success.data.type;
			user.is_superuser = success.data.attributes.is_superuser;
			user.role_type = success.data.attributes.role_type;
			for (var i = 0; i < success.included.length; i++) {
				if (success.included[i].type === 'organizations') 
				{
					Utils.setInStorage('organization', success.included[i].id);
				}
			}

			defered.resolve({
				success: true,
				detail: 'OK',
				data: user
			});

		}, function(error) {
			defered.reject({
				success: false,
				detail: error,
				data: ''
			});
		});

		return promise;
	};

	var getMenu = function() {

		var defered = $q.defer();
		var promise = defered.promise;
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
							if (success.included[k].id === menu[i].items[j].id) 
							{
								menu[i].items[j].included= success.included[k].attributes.url_include;
							}
						}
					}
				}
				Utils.setInStorage('menu', menu);
				$scope.page.menu = menu;
				$scope.page.menuLoaded = true;

				defered.resolve({
					success: true,
					detail: 'OK',
					data: menu
				});
			} else {
				$log.error(success);
				defered.reject({
					success: false,
					detail: error,
					data: ''
				});
			}
		}, function(error) {
			$log.error();
			defered.reject({
				success: false,
				detail: error,
				data: ''
			});
			if (error.status === 401) {
        		Utils.refreshToken(getMenu);
      		}
		});

		return promise;

	};

	var getColumns = function() {

		var defered = $q.defer();
		var promise = defered.promise;
		var columns = {};

		TableColumns.query({
			type: Utils.getInStorage('collection_name')
		}, function(success) {
			columns.reportColumns = [];

			for (i = 0; i < success.data.length; i++) {
				columns.reportColumns.push({
					title: success.data[i].attributes.column_name,
					field: success.data[i].attributes.field_name,
					field_a: success.data[i].attributes.column_name + '+' + success.data[i].attributes.field_name,
					name: i,
					visible: true,
					relationshipName: success.data[i].attributes.relationship_name,
					dataType: success.data[i].attributes.data_type,
					filters: success.data[i].attributes.headers,
					columnFilters: []
				});
				//columns.reportColumns[columns.reportColumns.length - 1].filter[success.data[i].attributes.field_name] = success.data[i].attributes.field_name;
			}

			Utils.setInStorage('report_columns', columns.reportColumns);
			if (Utils.getInStorage('organization') == 3) 
			{
				gotoManflas();
			}
			else
			{
				gotoReportList();
			}
			

		}, function(error) {
			defered.reject({
				success: false,
				detail: error,
				data: ''
			});
		});

		return promise;
	};

	var gotoReportList = function() {
		$state.go('efinding.inspecciones.list');
	};
	//Dashboard para Manflas
	var gotoManflas = function() {
		$state.go('efinding.dashboard.manflas');
	};

});