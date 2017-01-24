'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:MastersActivitiesCtrl
 * @description
 * # MastersActivitiesCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('MastersActivitiesCtrl', function($scope, $log, $uibModal, Activities, NgTableParams, $filter, Utils) {

	$scope.page = {
		title: 'Actividades'
	};
	var data = [];

	$scope.getActivity = function() {
		data = [];

		Activities.query({
			idActivity: ''
		}, function(success) {

			// $log.log(success);

			if (success.data) {
				data = [];
				for (var i = 0; i < success.data.length; i++) {
					data.push({
						// AQUI VAN LOS CAMPOS DEL JSON
						name: success.data[i].attributes.name,
						id: success.data[i].id
					});
				}

				$scope.tableParams = new NgTableParams({
					page: 1, // show first page
					count: 50, // count per page
					sorting: {
						name: 'desc' // initial sorting
					}
				}, {
					total: data.length, // length of data
					dataset: data
				});

			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
			if (error.status) {
				Utils.refreshToken($scope.getActivity);
			}
		});
	};

	$scope.openModalNewActivity = function() {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'newActivity.html',
			controller: 'NewActivityModalInstance',
			resolve: {}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'saveActivity') {
				data.push({
					name: datos.success.data.attributes.name,
					id: datos.success.data.id
				});
			}
			$scope.tableParams.reload();
		}, function() {});
	};

	$scope.openModalActivityDetails = function(idActivity) {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'activityDetails.html',
			controller: 'ActivityDetailsInstance',
			resolve: {
				idActivity: function() {
					return idActivity;
				}
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'removeActivity') {
				for (var i = 0; i < data.length; i++) {
					if (data[i].id === datos.idActivity) {
						data.splice(i, 1);
					}
				}
			}
			else if (datos.action === 'editActivity') {				
				for (var j = 0; j < data.length; j++) {
					if (data[j].id === datos.success.data.id) {
						data[j].name = datos.success.data.attributes.name;
						break;
					}
				}
			}
			$scope.tableParams.reload();
		}, function() {});
	};

	$scope.getActivity();

})

.controller('ActivityDetailsInstance', function($scope, $log, $uibModalInstance, idActivity, Activities, Validators, Utils) {

	$scope.user = {
		id: null,
		name: {
			text: '',
			disabled: true
		}
	};
	$scope.elements = {
		buttons: {
			editUser: {
				text: 'Editar',
				border: 'btn-border'
			},
			removeUser: {
				text: 'Eliminar',
				border: 'btn-border'
			}
		},
		title: '',
		alert: {
			show: false,
			title: '',
			text: '',
			color: '',
		}
	};

	$scope.ok = function() {
		// $uibModalInstance.close($scope.selected.item);
		$uibModalInstance.close();
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
	//$scope.activity.name.text = 'Mantención preventiva';

	$scope.getActivity = function(idActivity) {
		
		Activities.query({
			idActivity: idActivity
		}, function(success) {
			if (success.data) {
				$scope.user.id 		= success.data.id;
				$scope.user.name 	= success.data.attributes.name;

			} else {
				$log.log(success);
			}

		}, function(error) {
			$log.error(error);

		});
	};

	$scope.getActivity(idActivity);

	$scope.editActivity = function(idActivity) {

		if ($scope.elements.buttons.editUser.text === 'Editar') {
			$scope.elements.buttons.editUser.text = 'Guardar';
			$scope.elements.buttons.editUser.border = '';
			enableFormInputs();
		} else {

			if (!Validators.validateRequiredField($scope.user.name)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = '';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			$scope.elements.buttons.editUser.text = 'Editar';
			$scope.elements.buttons.editUser.border = 'btn-border';
			disableFormInputs();

			Activities.update({
				data: {
					type: 'activity_types',
					id: idActivity,
					attributes: {
						name: $scope.user.name,
					}
				},
				idActivity: idActivity
			}, function(success) {
				if (success.data) {
					$scope.elements.alert.title = 'Se han actualizado los datos de la actividad';
					$scope.elements.alert.text = '';
					$scope.elements.alert.color = 'success';
					$scope.elements.alert.show = true;

					disableFormInputs();

					$scope.getActivity(idActivity);

					$uibModalInstance.close({
						action: 'editActivity',
						success: success
					});

				} else {
					$log.log(success);
				}
			}, function(error) {
				$log.log(error);
			});

		}

	};

	$scope.removeActivity = function(idActivity) {

		if ($scope.elements.buttons.removeUser.text === 'Eliminar') {
			$scope.elements.buttons.removeUser.text = 'Si, eliminar';

			$scope.elements.buttons.removeUser.border = '';
			$scope.elements.alert.show = true;
			$scope.elements.alert.title = '¿Seguro que desea eliminar la actividad?';
			$scope.elements.alert.text = 'Para eliminarla, vuelva a presionar el botón';
			$scope.elements.alert.color = 'danger';

		} else {
			$scope.elements.buttons.removeUser.text = 'Eliminar';

			Activities.delete({
				idActivity: idActivity
			}, function(success) {

				$uibModalInstance.close({
					action: 'removeActivity',
					idActivity: idActivity
				});

			}, function(error) {
				$log.log(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.removeActivity);
				}
			});
		}

	};

	var enableFormInputs = function() {
		//$scope.user.name.disabled = false;
	};

	var disableFormInputs = function() {
		//$scope.user.name.disabled = true;
	};

	$scope.hideAlert = function() {
		$scope.elements.alert.show = false;
		$scope.elements.alert.title = '';
		$scope.elements.alert.text = '';
		$scope.elements.alert.color = '';
	};

})

.controller('NewActivityModalInstance', function($scope, $log, $uibModalInstance, Activities, Csv, Utils) {

	$scope.modal = {
		csvFile: null
	};

	$scope.saveActivity = function() {

		if ($scope.modal.csvFile) {
			uploadCsvActivity();
		} else 
		{
			//$log.error($scope.modal.activity.type);
			Activities.save({
			data: {
				type: 'activity_types',
				attributes: {
					name: $scope.modal.activity.type
				}
			}
			}, function(success) {
				if (success.data) {

					$uibModalInstance.close({
						action: 'saveActivity',
						success: success
					});
				} 
				else 
				{
					$log.error(success);
					$scope.modal.alert.title = 'Error al Guardar';
					$scope.modal.alert.text = '';
					$scope.modal.alert.color = 'danger';
					$scope.modal.alert.show = true;
					return;
				}
			}, function(error) {
				$log.error(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.saveActivity);
				}
				$scope.modal.alert.title = 'Error al Guardar';
				$scope.modal.alert.text = '';
				$scope.modal.alert.color = 'danger';
				$scope.modal.alert.show = true;
				return;
			});
		}

	};

	var uploadCsvActivity = function() {

		$log.log($scope.modal.csvFile);

		var form = [{
			field: 'type',
			value: 'activities'
		}, {
			field: 'csv',
			value: $scope.page.csvFile
		}, {
			field: 'namespace',
			value: 'belltech'
		}];

		Csv.uploadFileToUrl(form);

	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});