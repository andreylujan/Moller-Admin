'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:TasksProgramCtrl
 * @description
 * # TasksProgramCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('TasksProgramCtrl', function($scope, $log, $uibModal, $filter, Csv, Users, Equipments, Activities, Reports, Utils, Validators) {
	$scope.page = {
		forms: {},
		title: 'Programar Tarea',
		csvFile: null,
		users: [],
		selectedUser: null,
		equipments: [],
		selectedEquipment: null,
		activityTypes: [],
		selectedActivityType: null,
		usersLoaded: false,
		equipmentsLoaded: false,
		activityTypesLoaded: false,
		dateOptions: {
			formatYear: 'yy',
			startingDay: 1,
			'class': 'datepicker',
			format: 'dd-MMMM-yyyy',
			datepickerOpened: false,
			minDate: new Date()
		},
		limitDate: new Date(),
		limitTime: new Date(),
		buttons: {
			createProgramTask: {
				disabled: true
			}
		},
		alert: {
			title: '',
			subtitle: '',
			color: '',
			show: false
		}
	};
	var i = 0;

	$scope.openDatepicker = function() {
		$scope.page.dateOptions.datepickerOpened = true;
	};

	$scope.programTask = function() {

		$scope.page.buttons.createProgramTask.disabled = true;

		if ($scope.page.csvFile) {
			uploadCsvTask();
		} else {
			programTaskManual();
		}
	};

	$scope.getUsers = function() {

		$scope.page.users = [];

		Users.query({
			idUser: ''
		}, function(success) {

			$scope.page.users.push({
				id: '',
				fullName: 'Seleccione un usuario',
				disabled: true
			});

			for (i = 0; i < success.data.length; i++) {
				if (success.data[i].attributes.active) {
					$scope.page.users.push({
						id: success.data[i].id,
						fullName: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name,
						disabled: false
					});
				}
			}
			$scope.page.selectedUser = $scope.page.users[0];
			$scope.page.usersLoaded = true;
		}, function(error) {
			$log.error(error);
		});
	};

	$scope.getEquipments = function() {

		$scope.page.equipments = [];

		Equipments.query({
			idEquipment: ''
		}, function(success) {

			$scope.page.equipments.push({
				id: '',
				serial_number: 'Seleccione equipo',
				disabled: true
			});

			for (var i = 0; i < success.data.length; i++) {
				$scope.page.equipments.push({
					id: success.data[i].id,
					serial_number: $filter('capitalize')(success.data[i].attributes.serial_number, true),
					disabled: false
				});
			}
			$scope.page.selectedEquipment = $scope.page.equipments[0];
			$scope.page.equipmentsLoaded = true;

		}, function(error) {
			$log.error(error);
		});
	};

	$scope.getActivityTypes = function() {

		$scope.page.activityTypes = [];

		Activities.query({
			idActivity: ''
		}, function(success) {

			$scope.page.activityTypes.push({
				id: '',
				name: 'Seleccione tipo de actividad',
				disabled: true
			});

			for (var i = 0; i < success.data.length; i++) {
				$scope.page.activityTypes.push({
					id: success.data[i].id,
					name: success.data[i].attributes.name,
					disabled: false
				});
			}
			$scope.page.selectedActivityType = $scope.page.activityTypes[0];
			$scope.page.activityTypesLoaded = true;


		}, function(error) {
			$log.error(error);
		});
	};

	var uploadCsvTask = function() {

		// $log.log($scope.page.csvFile);

		var form = [{
			field: 'type',
			value: 'reports'
		}, {
			field: 'csv',
			value: $scope.page.csvFile
		}];

		var csvFile = $scope.page.csvFile;

		Csv.upload(form).success(function(success) {
			// $log.log(success);
			openModalSummary(success);
			$scope.page.buttons.createProgramTask.disabled = false;
			$scope.page.alert.color = 'success';
			Utils.gotoAnyPartOfPage('pageHeader');
			$scope.page.alert.title = 'Tareas cargadas';
			$scope.page.alert.subtitle = '';
			$scope.page.alert.show = true;
		}, function(error) {
			$log.log(error);
			$scope.page.buttons.createProgramTask.disabled = false;
			$scope.page.alert.color = 'danger';
			Utils.gotoAnyPartOfPage('pageHeader');
			$scope.page.alert.title = 'Error al cargar tareas: ';
			$scope.page.alert.subtitle = error.data.errors[0].detail;
			$scope.page.alert.show = true;
		});
	};

	var programTaskManual = function() {

		$scope.page.alert.color = '';
		$scope.page.alert.title = '';
		$scope.page.alert.subtitle = '';
		$scope.page.alert.show = false;

		if (!Validators.validateRequiredField($scope.page.selectedUser.id)) {
			$scope.page.alert.color = 'danger';
			$scope.page.alert.title = 'Faltan campos por seleccionar';
			$scope.page.alert.subtitle = 'Debe serleccionar un usuario';
			$scope.page.alert.show = true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		if (!Validators.validateRequiredField($scope.page.selectedEquipment.id)) {
			$scope.page.alert.color = 'danger';
			$scope.page.alert.title = 'Faltan campos por seleccionar';
			$scope.page.alert.subtitle = 'Debe serleccionar un equipo';
			$scope.page.alert.show = true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		if (!Validators.validateRequiredField($scope.page.selectedActivityType.id)) {
			$scope.page.alert.color = 'danger';
			$scope.page.alert.title = 'Faltan campos por seleccionar';
			$scope.page.alert.subtitle = 'Debe serleccionar un tipo de actividad';
			$scope.page.alert.show = true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		var limitDate = new Date(
			$scope.page.limitDate.getFullYear(),
			$scope.page.limitDate.getMonth(),
			$scope.page.limitDate.getDate(),
			$scope.page.limitTime.getHours(),
			$scope.page.limitTime.getMinutes(),
			$scope.page.limitTime.getSeconds(),
			$scope.page.limitTime.getMilliseconds());

		Reports.save({
			"data": {
				"type": "reports",
				"attributes": {
					"limit_date": limitDate,
					"finished": false
				},
				"relationships": {
					"activity_type": {
						"data": {
							"type": "activity_types",
							"id": $scope.page.selectedActivityType.id
						}
					},
					"equipment": {
						"data": {
							"type": "equipments",
							"id": $scope.page.selectedEquipment.id
						}
					},
					"assigned_user": {
						"data": {
							"type": "users",
							"id": $scope.page.selectedUser.id
						}
					}
				}
			}
		}, function(success) {
			// $log.log(success);
			Utils.gotoAnyPartOfPage('pageHeader');
			$scope.page.alert.color = 'success';
			$scope.page.alert.title = 'Tarea programada';
			$scope.page.alert.subtitle = '';
			$scope.page.alert.show = true;
			$scope.page.usersLoaded = false;
			$scope.page.equipmentsLoaded = false;
			$scope.page.activityTypesLoaded = false;
			$scope.page.forms.form1.user.$pristine = true;
			$scope.page.forms.form1.serialNumber.$pristine = true;
			$scope.page.forms.form1.activityType.$pristine = true;
			$scope.getUsers();
			$scope.getEquipments();
			$scope.getActivityTypes();
		}, function(error) {
			$log.error(error);
			$scope.page.buttons.createProgramTask.disabled = false;
			$scope.page.alert.color = 'danger';
			Utils.gotoAnyPartOfPage('pageHeader');
			$scope.page.alert.title = 'Error al programar la tarea: ';
			$scope.page.alert.subtitle = error.data.errors[0].detail;
			$scope.page.alert.show = true;
		});
	};

	var openModalSummary = function(data) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'summary.html',
			controller: 'SummaryLoadTasksModalInstance',
			resolve: {
				data: function() {
					return data;
				}
			}
		});

		modalInstance.result.then(function() {}, function() {
			// $scope.getUsers();
		});
	};

	$scope.getUsers();
	$scope.getEquipments();
	$scope.getActivityTypes();

})

.controller('SummaryLoadTasksModalInstance', function($scope, $log, $uibModalInstance, data) {

	$scope.modal = {
		countErrors: 0,
		countSuccesses: 0,
		countCreated: 0,
		countChanged: 0,
		errors: [],
		successes: []
	};
	var i = 0;

	for (i = 0; i < data.data.length; i++) {

		if (!data.data[i].meta.success) {
			$scope.modal.countErrors++;
		} else if (data.data[i].meta.created) {
			$scope.modal.countCreated++;
		} else if (data.data[i].meta.changed) {
			$scope.modal.countChanged++;
		}

		if (data.data[i].meta.errors) {
			$scope.modal.errors.push({
				rowNumber: data.data[i].meta.row_number,
				field: Object.keys(data.data[i].meta.errors)[0]
			});
		}

	}

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});