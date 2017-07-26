'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:MastersCompaniesCtrl
 * @description
 * # MastersCompaniesCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('MastersContractorsCtrl', function($scope, $log, $timeout, $state, $uibModal, NgTableParams, $filter, Utils, Contractors, ExcelContractors) {

	$scope.page = {
		title: 'Contratistas'
	};
	var data = [];

	var auxiliar = {};

	$scope.getContractors = function(e) {

 		Contractors.query({
 		}, function(success) {
 			if (success.data) {
				data = [];
				for (var i = 0; i < success.data.length; i++) {
					data.push({
						name: success.data[i].attributes.name,
						id: success.data[i].id,
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
 				Utils.refreshToken($scope.getContractors);
 			}
 		});
 	};

 	$scope.getContractors();

 	$scope.openModalObjectDetails = function(idObject) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'contractorDetails.html',
			controller: 'contractorDetailsInstance',
			resolve: {
				idObject: function() {
					return idObject;
				}
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'removeGeneric') {
				for (var i = 0; i < data.length; i++) {
					if (data[i].id === datos.CompanyId) {
						data.splice(i, 1);
					}
				}
			}
			else if (datos.action === 'editGeneric') {				
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

	$scope.openModalNewCompany = function() {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'newContractor.html',
			controller: 'NewContractorModalInstance',
			resolve: {
				CompanyId: function() {
					return auxiliar;
				}
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'save') {
				data.push({
					name: datos.success.data.attributes.name,
					id: datos.success.data.id
				});
			}
			$scope.tableParams.reload();
		}, function() {});
	};

	$scope.getExcel = function(e) {
		if (!e.success) {
			$log.error(e.detail);
			return;
		}
		ExcelContractors.getFile('#downloadExcel', 'contractors');
		$timeout(function() {
		}, 3000);
	};

	$scope.openModalNewGeneric = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: false,
			templateUrl: 'newContractorsMasive.html',
			controller: 'newContractorsMasive',
			resolve: {
			}
		});

		modalInstance.result.then(function() {
			$scope.getCompanies();
		}, function() {});
	};

})

.controller('contractorDetailsInstance', function($scope, $log, $uibModalInstance, idObject, Validators, Utils, Contractors) {
	$scope.contractor = {
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

	$scope.getContractor = function(idObject) {

 		Contractors.detail({
 			contractorId: idObject
 		}, function(success) {
 			if (success.data) {
 				$scope.contractor.id 				= success.data.id;
 				$scope.contractor.name.text 		= success.data.attributes.name;
 				$scope.contractor.name.disabled 	= false;

 				$scope.elements.title = $scope.contractor.name.text;

			} else {
				$log.error(success);
			}
 		}, function(error) {
 			$log.error(error);
 			if (error.status === 401) {
 				Utils.refreshToken($scope.getContractor);
 			}
 		});
 	};

 	$scope.getContractor(idObject);

 	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

 	$scope.editGeneric = function(idObject) {
		if ($scope.elements.buttons.editUser.text === 'Editar') {
			$scope.elements.buttons.editUser.text = 'Guardar';
			$scope.elements.buttons.editUser.border = '';
		} else {
			$scope.elements.buttons.editUser.text = 'Editar';
			$scope.elements.buttons.editUser.border = 'btn-border';

			var aux = { data: { type: 'contractors', id: idObject, 
								attributes: { name: $scope.contractor.name.text } }, contractorId: idObject };

			Contractors.update(aux, 
				function(success) {
					if (success.data) {
						$scope.elements.alert.title = 'Se han actualizado los datos del contratista';
						$scope.elements.alert.text = '';
						$scope.elements.alert.color = 'success';
						$scope.elements.alert.show = true;
						$scope.getContractor(idObject);

						$uibModalInstance.close({
							action: 'editGeneric',
							success: success
						});

					} else {
						$log.log(success);
					}
				}, function(error) {
					$log.log(error);
					if (error.status === 401) {
						Utils.refreshToken($scope.editGeneric);
					}
				}
			);
		}
	};

	$scope.removeGeneric = function(idObject) {

		if ($scope.elements.buttons.removeUser.text === 'Eliminar') {
			$scope.elements.buttons.removeUser.text = 'Si, eliminar';

			$scope.elements.buttons.removeUser.border = '';
			$scope.elements.alert.show = true;
			$scope.elements.alert.title = '¿Seguro que desea eliminar el contratista?';
			$scope.elements.alert.text = 'Para eliminarlo vuelva a presionar el botón.';
			$scope.elements.alert.color = 'danger';

		} else {
			$scope.elements.buttons.removeUser.text = 'Eliminar';

			Contractors.delete({
				contractorId: idObject
			}, function(success) {

				$uibModalInstance.close({
					action: 'removeGeneric',
					CompanyId: idObject
				});

			}, function(error) {
				$log.log(error);
				if (error.status == 401) {
					Utils.refreshToken($scope.removeGeneric);
				}
			});
		}

	};

	$scope.hideAlert = function() {
		$scope.elements.alert.show = false;
		$scope.elements.alert.title = '';
		$scope.elements.alert.text = '';
		$scope.elements.alert.color = '';
	};

})

.controller('NewContractorModalInstance', function($scope, $log, $state, $uibModalInstance, Utils, Contractors, Validators) {

	$scope.contractor = {
		name: '',
		rut: ''
	};
	$scope.elements = {
		alert: {
			show: false,
			title: '',
			text: '',
			color: '',
		},
		button: false
	};

	$scope.saveContractor = function() {

		var aux = { data: { type: 'contractors', 
								attributes: { name: $scope.contractor.name,
											  rut: $scope.contractor.rut } } };
		Contractors.save(aux, 
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
					Utils.refreshToken($scope.saveContractor);
				}
				$scope.elements.alert.title = 'Error al Guardar';
				$scope.elements.alert.text = error.data.errors[0].detail;
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}
		);

	};

	$scope.formatRut = function(rut) {

		if (Validators.validateRutCheckDigit(rut)) {
			$scope.contractor.rut = Utils.formatRut(rut);
			$scope.elements.button = false;
			$scope.elements.alert.show = false;
		} else {
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.show = true;
		 	$scope.elements.alert.title = 'Rut no válido';
		 	$scope.elements.button = true;
		}

	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

})

.controller('newContractorsMasive', function($scope, Utils, $log, $uibModalInstance, $uibModal, CsvContractors) {
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

		CsvContractors.upload(form)
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
			templateUrl: 'summaryContractors.html',
			controller: 'SummaryContractorsInstance',
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

.controller('SummaryContractorsInstance', function($scope, $log, $uibModalInstance, data) {

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