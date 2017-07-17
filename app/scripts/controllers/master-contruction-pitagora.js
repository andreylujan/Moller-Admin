'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:MastersConstructionPitagoraCtrl
 * @description
 * # MastersConstructionPitagoraCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('MastersConstructionPitagoraCtrl', function($scope, $log, $timeout, $state, $uibModal, NgTableParams, $filter, Utils, Constructions, ExcelConstruction) {

	$scope.page = {
		title: 'Obras'
	};
	var data = [];

	var auxiliar = {};

	$scope.getConstructions = function(e) {

 		Constructions.query({
 		}, function(success) {
 			if (success.data) {

				data = [];
				for (var i = 0; i < success.data.length; i++) {
					data.push({
						// AQUI VAN LOS CAMPOS DEL JSON
						name: success.data[i].attributes.name,
						code: success.data[i].attributes.code,
						fullname: success.data[i].attributes.code + ' - ' + success.data[i].attributes.name,
						id: success.data[i].id,
						company: success.data[i].attributes.company_id
					});
				}

				$scope.tableParams = new NgTableParams({
					page: 1, // show first page
					count: 50, // count per page
					sorting: {
						name: 'asc' // initial sorting
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
 			if (error.status === 401) {
 				Utils.refreshToken($scope.getConstructions);
 			}
 		});
 	};

 	$scope.openModalObjectDetails = function(idObject, idCompany) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'constructionDetailsPitagora.html',
			controller: 'constructionDetailsPitagoraInstance',
			resolve: {
				idObject: function() {
					return idObject;
				},
				idCompany: function() {
					return idCompany;
				},
			}
		});
	};

 	$scope.getConstructions();

	$scope.getExcel = function(e) {
		if (!e.success) {
			$log.error(e.detail);
			return;
		}
		ExcelConstruction.getFile('#downloadExcel', 'construction_personel');
		$timeout(function() {
		}, 3000);
	};

	$scope.openModalNewGeneric = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: false,
			templateUrl: 'newGenericConstructionMasive.html',
			controller: 'newGenericConstructionMasive',
			resolve: {
			}
		});

		modalInstance.result.then(function() {
			$scope.getConstructions();
		}, function() {});
	};

})

.controller('constructionDetailsPitagoraInstance', function($scope, $log, $uibModalInstance, idObject, idCompany, Validators, Utils, Constructions, Users, Contractors) {
	$scope.construction = {
		id: null,
		name: {
			text: '',
			disabled: true
		},
		contractors: [],
		administrator: {},
		expert: {},
		supervisor: {},
		inspector: {},
		jTerreno: {}
	};

	$scope.experts		= [];
	$scope.contractors 	= [];
	$scope.inspectors 	= [];
	$scope.jefesTerreno = [];
	$scope.admObra 		= [];
	$scope.supervisors 	= [];

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

	$scope.getConstruction = function(idObject) {

 		Constructions.detail({
 			constructionId: idObject,
 			include: 'administrator,expert,construction_personnel.personnel,construction_personnel.personnel_type,inspector,supervisor,contractors'
 		}, function(success) {
 			if (success.data) {
 				var administrador 	= success.data.relationships.administrator.data,
 				    experto 		= success.data.relationships.expert.data,
 				  	personal 		= success.data.relationships.construction_personnel.data,
 				  	inspector 		= success.data.relationships.inspector.data,
 				  	supervisor 		= success.data.relationships.supervisor.data;

 				$scope.construction.id = success.data.id;
 				$scope.construction.name.text = success.data.attributes.name;
 				$scope.construction.code = success.data.attributes.code;

				var contratistas = [];

				if (_.has(success, "included")) 
				{
					if (experto == null) 
					{
						experto = {id: null, type:null};
					}
					if (administrador == null) 
					{
						administrador = {id: null, type:null};
					}
					if (inspector == null) 
					{
						inspector = {id: null, type:null};
					}
					if (supervisor == null) 
					{
						supervisor = {id: null, type:null};
					}
					
					for (var i = 0; i < success.included.length; i++) {
						if (success.included[i].id === administrador.id && success.included[i].type === administrador.type) 
						{
							$scope.construction.administrator = success.included[i];
						}
						if (success.included[i].id === experto.id && success.included[i].type === experto.type) 
						{
							$scope.construction.expert = success.included[i];
						}
						if (success.included[i].id === inspector.id && success.included[i].type === inspector.type) 
						{
							$scope.construction.inspector = success.included[i];
						}
						if (success.included[i].id === supervisor.id && success.included[i].type === supervisor.type) 
						{
							$scope.construction.supervisor = success.included[i];
						}
					}
					contratistas = _.where(success.included, {type: "contractors"});
				}

				for (var i = 0; i < contratistas.length; i++) {
					$scope.construction.contractors.push({id: contratistas[i].id, name:contratistas[i].attributes.name});
				}
				
				$scope.getUsers();
				$scope.getContractors();

			} else {
				$log.error(success);
			}
 		}, function(error) {
 			$log.error(error);
 			if (error.status === 401) {
 				Utils.refreshToken($scope.getConstruction);
 			}
 		});
 	};


 	$scope.getUsers = function() {

		Users.query({
			idUser: ''
		}, function(success) {
			if (success.data) {
				var data = [];
				for (var i = 0; i < success.data.length; i++) {
					data.push({
						id: success.data[i].id,
						firstName: success.data[i].attributes.first_name,
						lastName: success.data[i].attributes.last_name,
						email: success.data[i].attributes.email,
						roleName: success.data[i].attributes.role_name,
						roleId: success.data[i].attributes.role_id,
						active: success.data[i].attributes.active,
						fullName: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name
					});

					if ($scope.construction.expert != undefined) 
					{
						if ($scope.construction.expert.id === success.data[i].id) 
						{
							$scope.construction.selectedExpert = {fullName: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name, id: success.data[i].id };
						}
					}

					if ($scope.construction.administrator != undefined) 
					{
						if ($scope.construction.administrator.id === success.data[i].id) 
						{
							$scope.construction.selectedAdministrador = {fullName: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name, id: success.data[i].id };
						}
					}

					if ($scope.construction.inspector != undefined) 
					{
						if ($scope.construction.inspector.id === success.data[i].id) 
						{
							$scope.construction.selectedInspector = {fullName: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name, id: success.data[i].id };
						}
					}

					if ($scope.construction.supervisor != undefined) 
					{
						if ($scope.construction.supervisor.id === success.data[i].id) 
						{
							$scope.construction.selectedSupervisor = {fullName: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name, id: success.data[i].id };
						}
					}
				}

				$scope.admObra = data;
				$scope.experts = data;
				$scope.inspectors = data;
				$scope.supervisors = data;

				//Cambiar ids en produccion
				//Administradores de obra
				$scope.admObra 		= _.where(_.reject(data, function(object){ return object.id === ""; }), {roleId: '13'});
				$scope.experts 		= _.where(_.reject(data, function(object){ return object.id === ""; }), {roleId: '12'});
				$scope.inspectors 	= _.where(_.reject(data, function(object){ return object.id === ""; }), {roleId: '16'});
				$scope.supervisors 	= _.where(_.reject(data, function(object){ return object.id === ""; }), {roleId: '14'});


			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getUsers);
			}
		});

	};

	$scope.getContractors = function(e) {

 		Contractors.query({
 		}, function(success) {
 			if (success.data) {
				 var data = [];
				for (var i = 0; i < success.data.length; i++) {
					data.push({
						name: success.data[i].attributes.name,
						id: success.data[i].id,
					});
				}

				$scope.contractors = data;
			} else {
				$log.error(success);
			}
 		}, function(error) {
 			$log.error(error);
 			if (error.status === 401) {
 				Utils.refreshToken($scope.getContractors);
 			}
 		});
 	};

 	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

 	$scope.getConstruction(idObject);

 	$scope.editGeneric = function(idObject) {
		if ($scope.elements.buttons.editUser.text === 'Editar') 
		{
			$scope.elements.buttons.editUser.text = 'Guardar';
			$scope.elements.buttons.editUser.border = '';
		} 
		else 
		{
			if (!Validators.validateRequiredField($scope.construction.selectedAdministrador)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = 'Adminsitrador de obra';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}
			if (!Validators.validateRequiredField($scope.construction.selectedSupervisor)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = 'APR';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}
			if (!Validators.validateRequiredField($scope.construction.selectedExpert)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = 'Jefe de terreno';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}
			if (!Validators.validateRequiredField($scope.construction.selectedInspector)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = 'Inspector';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			if (!Validators.validateRequiredField($scope.construction.contractors)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = 'Contratistas';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			$scope.elements.alert.show = false;


			$scope.elements.buttons.editUser.text = 'Editar';
			$scope.elements.buttons.editUser.border = 'btn-border';
			var contratistas = []
			
			angular.forEach($scope.construction.contractors, function(value){
				contratistas.push({ id:value.id, type:"contractors"});
			});

			var aux = { 
						data: { 
							type: 'constructions', 
							id: idObject, 
							attributes: { 
								name: $scope.construction.name.text,
							}, 
							relationships: { 
								administrator: { 
									data: { 
										type: "users", 
										id: $scope.construction.selectedAdministrador.id
									} 
								},
								expert: { 
									data: { 
										type: "users", 
										id: $scope.construction.selectedExpert.id
									} 
								},
								inspector: { 
									data: { 
										type: "users", 
										id: $scope.construction.selectedInspector.id
									} 
								},
								supervisor: { 
									data: { 
										type: "users", 
										id: $scope.construction.selectedSupervisor.id
									} 
								},
								contractors: {
									data: contratistas
								}
							} 
						} , constructionId: idObject };

			Constructions.update(aux, 
				function(success) {
					if (success.data) {
						$scope.elements.alert.title = 'Se han actualizado los datos de la obra';
						$scope.elements.alert.text = '';
						$scope.elements.alert.color = 'success';
						$scope.elements.alert.show = true;
						$scope.getConstruction(idObject);

						$uibModalInstance.close({
							action: 'editGeneric',
							success: success
						});

					} else {
						$log.error(success);
					}
				}, function(error) {
					$log.error(error);
					if (error.status === 401) {
						Utils.refreshToken($scope.editGeneric);
					}
				}
			);
		}
	};

	$scope.hideAlert = function() {
		$scope.elements.alert.show = false;
		$scope.elements.alert.title = '';
		$scope.elements.alert.text = '';
		$scope.elements.alert.color = '';
	};

})

.controller('newGenericConstructionMasive', function($scope, Utils, $log, $uibModalInstance, $uibModal, CsvContructions) {
	$scope.modal = {
		csvFile: null,
		btns: {
			chargeSave: {
				disabled: false
			}
		},
		overlay: {
			show: false
		},
		alert: {
			color: '',
			show: false,
			title: '',
			subtitle: '',
			text: ''
		}
	};

	$scope.save = function() {

		$scope.modal.btns.chargeSave.disabled = true;

		if ($scope.modal.csvFile) {
			uploadCsv();
		} else {

		}

	};

	var uploadCsv = function() {
		var form = [{
			field: 'csv',
			value: $scope.modal.csvFile
		}];

		$scope.modal.overlay.show = true;

		CsvContructions.upload(form)
			.success(function(success) {
				$scope.modal.overlay.show = false;
				$uibModalInstance.close();
				openModalSummary(success);
			}).error(function(error) {
				$log.error(error);
				$scope.modal.overlay.show = false;
				$scope.modal.alert.show = true;
				$scope.modal.alert.title = 'Error '+error.errors[0].status;
				$scope.modal.alert.text = error.errors[0].detail;
				$scope.modal.alert.color = 'danger';
			});

	};

	var openModalSummary = function(data) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'summary.html',
			controller: 'SummaryLoadModalInstance',
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

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.ok = function() {
		$uibModalInstance.close();
	};


})

.controller('SummaryLoadModalInstance', function($scope, $log, $uibModalInstance, data) {

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