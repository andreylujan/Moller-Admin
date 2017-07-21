'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:MastersCompaniesCtrl
 * @description
 * # MastersCompaniesCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('MastersCompaniesCtrl', function($scope, $log, $timeout, $state, $uibModal, NgTableParams, $filter, Utils, Companies, ExcelCompanies) {

	$scope.page = {
		title: 'Empresas'
	};
	var data = [];

	var auxiliar = {};

	$scope.getCompanies = function(e) {

 		Companies.query({
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
 				Utils.refreshToken($scope.getCompanies);
 			}
 		});
 	};

 	$scope.getCompanies();

 	$scope.openModalObjectDetails = function(idObject) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'companyDetails.html',
			controller: 'companyDetailsInstance',
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
			templateUrl: 'newCompany.html',
			controller: 'NewCompanyModalInstance',
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
		ExcelCompanies.getFile('#downloadExcel', 'companies');
		$timeout(function() {
		}, 3000);
	};

	$scope.openModalNewGeneric = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: false,
			templateUrl: 'newCompanyMasive.html',
			controller: 'newCompanyMasive',
			resolve: {
			}
		});

		modalInstance.result.then(function() {
			$scope.getCompanies();
		}, function() {});
	};

})

.controller('companyDetailsInstance', function($scope, $log, $uibModalInstance, idObject, Validators, Utils, Companies) {
	$scope.company = {
		id: null,
		name: {
			text: ''
		},
		disabled: true
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

	$scope.getCompany = function(idObject) {

 		Companies.detail({
 			companyId: idObject
 		}, function(success) {
 			if (success.data) {
 				$scope.company.id 				= success.data.id;
 				$scope.company.name.text 		= success.data.attributes.name;
 				$scope.company.name.disabled 	= false;

 				$scope.elements.title = $scope.company.name.text;

			} else {
				$log.error(success);
			}
 		}, function(error) {
 			$log.error(error);
 			if (error.status === 401) {
 				Utils.refreshToken($scope.getCompany);
 			}
 		});
 	};

 	$scope.getCompany(idObject);

 	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

 	$scope.editGeneric = function(idObject) {
		if ($scope.elements.buttons.editUser.text === 'Editar') {
			$scope.elements.buttons.editUser.text = 'Guardar';
			$scope.elements.buttons.editUser.border = '';
			$scope.company.disabled = false;
		} else {
			$scope.elements.buttons.editUser.text = 'Editar';
			$scope.elements.buttons.editUser.border = 'btn-border';

			var aux = { data: { type: 'companies', id: idObject, 
								attributes: { name: $scope.company.name.text } }, companyId: idObject };

			Companies.update(aux, 
				function(success) {
					if (success.data) {
						$scope.elements.alert.title = 'Se han actualizado los datos de la empresa';
						$scope.elements.alert.text = '';
						$scope.elements.alert.color = 'success';
						$scope.elements.alert.show = true;
						$scope.getCompany(idObject);

						$uibModalInstance.close({
							action: 'editGeneric',
							success: success
						});

					} else {
						$log.log(success);
						$scope.company.disabled = true;
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
			$scope.elements.alert.title = '¿Seguro que desea eliminar la empresa?';
			$scope.elements.alert.text = 'Para eliminarla vuelva a presionar el botón.';
			$scope.elements.alert.color = 'danger';

		} else {
			$scope.elements.buttons.removeUser.text = 'Eliminar';

			Companies.delete({
				companyId: idObject
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

.controller('NewCompanyModalInstance', function($scope, $log, $state, $uibModalInstance, Utils, Companies) {

	$scope.company = {
		name: '',
	};

	$scope.saveCompany = function() {

		var aux = { data: { type: 'companies', 
								attributes: { name: $scope.company.name } } };
		Companies.save(aux, 
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
					$scope.modal.alert.title = 'Error al Guardar';
					$scope.modal.alert.text = '';
					$scope.modal.alert.color = 'danger';
					$scope.modal.alert.show = true;
					return;
				}
			}, function(error) {
				$log.error(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.saveCompany);
				}
				$scope.modal.alert.title = 'Error al Guardar';
				$scope.modal.alert.text = '';
				$scope.modal.alert.color = 'danger';
				$scope.modal.alert.show = true;
				return;
			}
		);

	};

	

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

})

.controller('newCompanyMasive', function($scope, Utils, $log, $uibModalInstance, $uibModal, CsvCompanies) {
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

		CsvCompanies.upload(form)
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
			controller: 'SummaryCompanyInstance',
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

.controller('SummaryCompanyInstance', function($scope, $log, $uibModalInstance, data) {

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