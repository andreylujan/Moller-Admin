'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:MastersConstructionPitagoraCtrl
 * @description
 * # MastersConstructionPitagoraCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('MastersConstructionPitagoraCtrl', function($scope, $log, $timeout, $state, $uibModal, NgTableParams, $filter, Utils, Constructions, ExcelConstructionPitagora) {

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
						name: success.data[i].attributes.name,
						code: success.data[i].attributes.code,
						fullname: success.data[i].attributes.code + ' - ' + success.data[i].attributes.name,
						id: success.data[i].id,
						company: success.data[i].attributes.company_id
					});
				}

				$scope.tableParams = new NgTableParams({
					page: 1,
					count: 50,
					sorting: {
						name: 'asc'
					}
				}, {
					total: data.length,
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
		ExcelConstructionPitagora.getFile('#downloadExcel', 'construction');
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

	$scope.openModalNewConstruction = function() {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'newConstruction.html',
			controller: 'NewConstructionModalInstance',
			resolve: {
				CompanyId: function() {
					return auxiliar;
				}
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'save') {
				data.push({
					fullname: datos.success.data.attributes.code + ' - ' +datos.success.data.attributes.name,
					id: datos.success.data.id
				});
			}
			$scope.tableParams.reload();
		}, function() {});
	};

})

.controller('NewConstructionModalInstance', function($scope, $log, $state, $uibModalInstance, Utils, Validators, Constructions, Users, Contractors, Companies) {

	$scope.construction = {
		id: null,
		name: {
			text: '',
			disabled: true
		},
		contractors: [],
		inspectors: [],
		experts: []
	};

	$scope.experts		= [];
	$scope.companies	= [];
	$scope.contractors 	= [];
	$scope.inspectors 	= [];
	$scope.jefesTerreno = [];
	$scope.admObra 		= [];
	$scope.supervisors 	= [];

	$scope.elements = {
		alert: {
			show: false,
			title: '',
			text: '',
			color: '',
		}
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
						role_type: success.data[i].attributes.role_type,
						fullName: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name
					});
				}
				$scope.admObra 		= _.where(_.reject(data, function(object){ return object.id === ""; }), {role_type: 'administrator'});
				$scope.experts 		= _.where(_.reject(data, function(object){ return object.id === ""; }), {role_type: 'expert'});
				$scope.inspectors 	= _.where(_.reject(data, function(object){ return object.id === ""; }), {role_type: 'inspector'});
				$scope.supervisors 	= _.where(_.reject(data, function(object){ return object.id === ""; }), {role_type: 'supervisor'});


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

 	$scope.getCompanies = function(e) {

 		Companies.query({
 		}, function(success) {
 			if (success.data) {
				 var data = [];
				for (var i = 0; i < success.data.length; i++) {
					data.push({
						name: success.data[i].attributes.name,
						id: success.data[i].id,
					});
				}
				$scope.companies = data;
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

	$scope.getUsers();
	$scope.getCompanies();
	$scope.getContractors();

	$scope.saveConstruction = function() {

		if (!Validators.validateRequiredField($scope.construction.name.text)) {
			$scope.elements.alert.title = 'Faltan datos por rellenar';
			$scope.elements.alert.text = 'Nombre';
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.show = true;
			return;
		}
		if (!Validators.validateRequiredField($scope.construction.code)) {
			$scope.elements.alert.title = 'Faltan datos por rellenar';
			$scope.elements.alert.text = 'Código';
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.show = true;
			return;
		}
		if (!Validators.validateRequiredField($scope.construction.selectedCompany)) {
			$scope.elements.alert.title = 'Faltan datos por rellenar';
			$scope.elements.alert.text = 'Empresa';
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.show = true;
			return;
		}
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
		if ($scope.construction.experts.length == 0) {
			$scope.elements.alert.title = 'Faltan datos por rellenar';
			$scope.elements.alert.text = 'Jefe de terreno';
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.show = true;
			return;
		}

		if ($scope.construction.contractors.length == 0) {
			$scope.elements.alert.title = 'Faltan datos por rellenar';
			$scope.elements.alert.text = 'Contratistas';
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.show = true;
			return;
		}

		/*if (!Validators.validateRequiredField($scope.construction.selectedInspector)) {
			$scope.construction.selectedInspector = {id: null};
		}*/

		$scope.elements.alert.show = false;
		var contratistas = []
		angular.forEach($scope.construction.contractors, function(value)
		{
			contratistas.push({ id:value.id, type:"contractors"});
		});


		var usuarios = []
		angular.forEach($scope.construction.experts, function(value, key)
		{
			usuarios.push({id: value.id, type:"users"});	
		});
		angular.forEach($scope.construction.inspectors, function(value, key)
		{
			usuarios.push({id: value.id, type:"users"});	
		});

		var aux = { 
					data: { 
						type: 'constructions', 
						attributes: { 
							name: $scope.construction.name.text,
							code: $scope.construction.code,
						}, 
						relationships: { 
							company: { 
								data: { 
									type: "companies", 
									id: $scope.construction.selectedCompany.id
								} 
							},
							administrator: { 
								data: { 
									type: "users", 
									id: $scope.construction.selectedAdministrador.id
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
							},
							users: {
								data: usuarios
							}
						} 
					}};

		Constructions.save(aux, 
			function(success) {
				if (success.data) {
					$uibModalInstance.close({
						action: 'save',
						success: success
					});
				} 
				else 
				{
					$log.error(success);
					$scope.elements.alert.title = 'Error al Guardar';
					$scope.elements.alert.text = '';
					$scope.elements.alert.color = 'danger';
					$scope.elements.alert.show = true;
					return;
				}
			}, function(error) {
				$log.error(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.saveConstruction);
				}
				$scope.elements.alert.title = 'Error al Guardar';
				$scope.elements.alert.text = error.data.errors[0].detail;
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}
		);
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

})

.controller('constructionDetailsPitagoraInstance', function($scope, $log, $uibModalInstance, idObject, idCompany, Validators, Utils, Constructions, Users, Contractors, Companies) {
	$scope.construction = {
		id: null,
		name: {
			text: '',
			disabled: true
		},
		contractors: [],
		administrator: {},
		experts: [],
		inspectors: [],
		supervisor: {},
		jTerreno: {},
		companyId: ''
	};

	$scope.expertsD	= true;


	$scope.experts		= [];
	$scope.contractors 	= [];
	$scope.inspectors 	= [];
	$scope.jefesTerreno = [];
	$scope.admObra 		= [];
	$scope.supervisors 	= [];
	$scope.companies 	= [];

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
 			include: 'administrator,construction_personnel.personnel,construction_personnel.personnel_type,supervisor,contractors,users'
 		}, function(success) {
 			if (success.data) {
 				var administrador 	= success.data.relationships.administrator.data,
 				  	personal 		= success.data.relationships.construction_personnel.data,
 				  	supervisor 		= success.data.relationships.supervisor.data,
 				  	users 		    = success.data.relationships.users.data;

 				$scope.construction.id = success.data.id;
 				$scope.construction.name.text = success.data.attributes.name;
 				$scope.construction.code = success.data.attributes.code;
 				$scope.construction.companyId = success.data.attributes.company_id;

				var contratistas = [];

				if (_.has(success, "included")) 
				{
					if (administrador == null) 
					{
						administrador = {id: null, type:null};
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
						if (success.included[i].id === supervisor.id && success.included[i].type === supervisor.type) 
						{
							$scope.construction.supervisor = success.included[i];
						}
					}
					contratistas 	= _.where(success.included, {type: "contractors"});
					users 			= _.where(success.included, {type: "users"});
				}

				for (var i = 0; i < contratistas.length; i++) {
					$scope.construction.contractors.push({id: contratistas[i].id, name:contratistas[i].attributes.name});
				}

				$scope.construction.inspectors = _.where(_.map(users, function(u){ return {id: u.id, fullName: u.attributes.first_name + ' ' + u.attributes.last_name, role_type: u.attributes.role_type }; }), { role_type: 'inspector'});
				$scope.construction.experts = _.where(_.map(users, function(u){ return {id: u.id, fullName: u.attributes.first_name + ' ' + u.attributes.last_name, role_type: u.attributes.role_type }; }), { role_type: 'expert'});

				$scope.getUsers();
				$scope.getContractors();
				$scope.getCompanies();

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
						role_type: success.data[i].attributes.role_type,
						fullName: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name
					});

					if ($scope.construction.administrator != undefined) 
					{
						if ($scope.construction.administrator.id === success.data[i].id) 
						{
							$scope.construction.selectedAdministrador = {fullName: success.data[i].attributes.first_name + ' ' + success.data[i].attributes.last_name, id: success.data[i].id };
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
				$scope.admObra 		= _.where(_.reject(data, function(object){ return object.id === ""; }), {role_type: 'administrator'});
				$scope.experts 		= _.where(_.reject(data, function(object){ return object.id === ""; }), {role_type: 'expert'});
				$scope.inspectors 	= _.where(_.reject(data, function(object){ return object.id === ""; }), {role_type: 'inspector'});
				$scope.supervisors 	= _.where(_.reject(data, function(object){ return object.id === ""; }), {role_type: 'supervisor'});


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

	$scope.getCompanies = function(e) {
 		Companies.query({
 		}, function(success) {
 			if (success.data) {
				 var data = [];
				for (var i = 0; i < success.data.length; i++) {
					data.push({
						name: success.data[i].attributes.name,
						id: success.data[i].id,
					});
					if (success.data[i].id == $scope.construction.companyId) 
					{
						$scope.construction.selectedCompany = data[i];
					}
				}
				$scope.companies = data;
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
			$scope.expertsD	= false;
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
			if ($scope.construction.experts.length == 0) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = 'Jefe de terreno';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			if ($scope.construction.contractors.length == 0) {
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

			var usuarios = []
			angular.forEach($scope.construction.experts, function(value, key)
			{
				usuarios.push({id: value.id, type:"users"});	
			});
			angular.forEach($scope.construction.inspectors, function(value, key)
			{
				usuarios.push({id: value.id, type:"users"});	
			});

			var aux = { 
						data: { 
							type: 'constructions', 
							id: idObject, 
							attributes: { 
								name: $scope.construction.name.text,
							}, 
							relationships: { 
								company: { 
									data: { 
										type: "companies", 
										id: $scope.construction.selectedCompany.id
									} 
								},
								administrator: { 
									data: { 
										type: "users", 
										id: $scope.construction.selectedAdministrador.id
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
								},
								users: {
									data: usuarios
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
					$scope.elements.alert.title = 'Error al Guardar';
					$scope.elements.alert.text = error.data.errors[0].detail;
					$scope.elements.alert.color = 'danger';
					$scope.elements.alert.show = true;
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

.controller('newGenericConstructionMasive', function($scope, Utils, $log, $uibModalInstance, $uibModal, CsvConstructionPitagora) {
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

		CsvConstructionPitagora.upload(form)
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