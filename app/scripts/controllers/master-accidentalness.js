'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:MastersConstructionCtrl
 * @description
 * # MastersConstructionCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('MastersAccidentalnessCtrl', function($scope, $log, $timeout, $state, $uibModal, NgTableParams,
												 $filter, Utils, Accidents, ExcelAccidentalness) {

	$scope.page = {
		title: 'Accidentabilidad y siniestralidad mensual'
	};
	var data = [];

	var auxiliar = {};

	$scope.getAccidentalness = function() {

 		Accidents.query({
 		}, function(success) {
 			if (success.data) 
 			{
				data = [];
				for (var i = 0; i < success.data.length; i++) 
				{
					for (var j = 0; j < success.included.length; j++) 
					{
						if (success.data[i].relationships['construction'].data.id == success.included[j].id &&
							success.data[i].relationships['construction'].data.type == success.included[j].type ) 
						{
							data.push({
								obra: 	success.included[j].attributes.name,
								mes: 	success.data[i].attributes.month,
								ano: 	success.data[i].attributes.year,
								id: 	success.data[i].id
							});	
						}
					}
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
 				Utils.refreshToken($scope.getAccidentalness);
 			}
 		});
 	};

 	$scope.openModalObjectDetails = function(idObject) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'accidentallnessDetail.html',
			controller: 'accidentallnessDetailInstance',
			resolve: {
				idObject: function() {
					return idObject;
				}
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'removeGeneric') {
				for (var i = 0; i < data.length; i++) {
					if (data[i].id === datos.accidentId) {
						data.splice(i, 1);
					}
				}
			}
			$scope.tableParams.reload();
		}, function() {});
	};

	$scope.getExcel = function(e) {
		ExcelAccidentalness.getFile('#downloadExcel', 'accident_rates');
		$timeout(function() {
		}, 3000);
	};

	$scope.openModalNewGeneric = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: false,
			templateUrl: 'newAccidentalnessMasive.html',
			controller: 'newAccidentalnessMasiveinstance',
			resolve: {
			}
		});

		modalInstance.result.then(function() {
			$scope.getAccidentalness();
		}, function() {});
	};

	$scope.openModalNewAccidentalness = function() {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'newAccidentalness.html',
			controller: 'newAccidentalnessInstance',
			resolve: {}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'save') {
				data.push({
					obra: 	datos.obra,
					mes: 	datos.success.data.attributes.month,
					ano: 	datos.success.data.attributes.year,
					id: 	datos.success.data.id
				});
			}
			$scope.tableParams.reload();
		}, function() {});
	};

	$scope.getAccidentalness();

})

.controller('newAccidentalnessInstance', function($scope, $log, $state, $uibModalInstance, Utils, Validators,
													Companies, Constructions, Accidents) {

	$scope.accidentalness = {
		obra: {
			text: '',
			id: '',
			disabled: true
		},
		fecha: {
			mes: '',
			ano: '',
			text: '',
			disabled: true
		},
		trabajadores: {
			text: '',
			disabled: true
		},
		hh: {
			text: '',
			disabled: true
		},
		accidentes: {
			text: '',
			disabled: true
		},
		diasPerdidos: {
			text: '',
			disabled: true
		},
		siniestralidad: {
			text: '',
			disabled: true
		},
		accidentabilidad: {
			text: '',
			disabled: true
		},
		frecuencia: {
			text: ''
		},
		gravedad: {
			text: ''
		},
	};

	$scope.modal = {
		datepicker: {
			opened: false
		}
	};

	$scope.elements = {
		alert: {
			show: false,
			title: '',
			text: '',
			color: '',
		}
	};

	$scope.companies		= {};
	$scope.constructions	= [];


	var getCompanies = function() {
 		$scope.companies.list = [];

 		Companies.query({}, function(success) {
 			if (success.data) {
 				angular.forEach(success.data, function(value, key) {
 					$scope.companies.list.push({
 						id: parseInt(value.id),
 						name: value.attributes.name,
 					});
 				});

 				$scope.companies.selected = $scope.companies.list[0];
 				$scope.getConstructions($scope.companies.selected);

 			} else {
 				$log.error(success);
 			}
 		}, function(error) {
 			$log.error(error);
 			if (error.status === 401) {
 				Utils.refreshToken(getCompanies);
 			}
 		});
 	};

 	$scope.getConstructions = function(companySelected) {

 		$scope.constructions.selected = [];
 		$scope.constructions.list = [];

 		Constructions.query({
 			'filter[company_id]': companySelected.id
 		}, function(success) {
 			if (success.data) {
 				for (var i = 0; i < success.data.length; i++) {
 					$scope.constructions.list.push({
 						id: parseInt(success.data[i].id),
 						name: success.data[i].attributes.name
 					});
 				}
 				$scope.constructions.selected = $scope.constructions.list[0];
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

 	getCompanies();

	
 	$scope.saveAccidentalness = function() {

 		if (!Validators.validateRequiredField($scope.accidentalness.fecha.text)) {
			$scope.elements.alert.title = 'Faltan datos por rellenar';
			$scope.elements.alert.text = 'Fecha';
			$scope.elements.alert.color = 'danger';
			$scope.elements.alert.show = true;
			Utils.gotoAnyPartOfPage('pageHeader');
			return;
		}

		var month 	= $scope.accidentalness.fecha.text.getMonth() + 1;
		var year 	= $scope.accidentalness.fecha.text.getFullYear();
		var obraId  = $scope.constructions.selected.id;

		var aux = { 
					data: { 
						type: 'accident_rates',
						attributes: 
						{
							month: month,
							year: year,
							worker_average: $scope.accidentalness.trabajadores.text,
							man_hours: $scope.accidentalness.hh.text,
							num_accidents: $scope.accidentalness.accidentes.text,
							num_days_lost: $scope.accidentalness.diasPerdidos.text,
							accident_rate: $scope.accidentalness.accidentabilidad.text,
							casualty_rate: $scope.accidentalness.siniestralidad.text
						}, 
						relationships: { 
							construction: { 
								data: { 
									type: "constructions", 
									id: obraId
								} 
							} 
						} 
					}};
		$log.error(aux.data);

		Accidents.save(aux, 
			function(success) {
				if (success.data) {
					$uibModalInstance.close({
						action: 'save',
						success: success,
						obra: $scope.constructions.selected.name
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
					Utils.refreshToken($scope.saveAccidentalness);
				}
				$scope.elements.alert.title = 'Error al Guardar';
				$scope.elements.alert.text = error.errors[0].detail;
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}
		);
	};


 	$scope.openDatePicker = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.modal.datepicker.opened = !$scope.modal.datepicker.opened;
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

})


.controller('accidentallnessDetailInstance', function($scope, $log, $uibModalInstance, Validators, idObject, Accidents) {
	$scope.accidentalness = {
		id: null,
		obra: {
			text: '',
			id: '',
			disabled: true
		},
		fecha: {
			mes: '',
			ano: '',
			text: '',
			disabled: true
		},
		trabajadores: {
			text: '',
			disabled: true
		},
		hh: {
			text: '',
			disabled: true
		},
		accidentes: {
			text: '',
			disabled: true
		},
		diasPerdidos: {
			text: '',
			disabled: true
		},
		siniestralidad: {
			text: '',
			disabled: true
		},
		accidentabilidad: {
			text: '',
			disabled: true
		},
		frecuencia: {
			text: ''
		},
		gravedad: {
			text: ''
		},
	};

	$scope.elements = {
		buttons: {
			editUser: {
				text: 'Editar',
				border: 'btn-border',
				disabled: false
			},
			removeUser: {
				text: 'Eliminar',
				border: 'btn-border',
				disabled: false
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

	$scope.getAccidentalness = function(idObject) {

 		Accidents.detail({
 			accidentId: idObject
 		}, function(success) {
 			if (success.data) 
 			{
 				for (var i = 0; i < success.included.length; i++) 
 				{
 					if (success.data.relationships['construction'].data.id === success.included[i].id && 
 						success.data.relationships['construction'].data.type === success.included[i].type) 
 					{
 						$scope.accidentalness.id 						= idObject;
 						$scope.accidentalness.obra.text 				= success.included[i].attributes.name;
 						$scope.accidentalness.obra.id 					= success.included[i].id;
 						$scope.accidentalness.fecha.mes 				= success.data.attributes.month;
 						$scope.accidentalness.fecha.ano 				= success.data.attributes.year;
 						$scope.accidentalness.fecha.text 				= success.data.attributes.month + '/'+ success.data.attributes.year;
 						$scope.accidentalness.trabajadores.text 		= success.data.attributes.worker_average;
 						$scope.accidentalness.hh.text 					= success.data.attributes.man_hours;
 						$scope.accidentalness.accidentes.text 			= success.data.attributes.num_accidents;
 						$scope.accidentalness.diasPerdidos.text 		= success.data.attributes.num_days_lost;
 						$scope.accidentalness.siniestralidad.text 		= success.data.attributes.casualty_rate;
 						$scope.accidentalness.accidentabilidad.text 	= success.data.attributes.accident_rate;

 						$scope.accidentalness.frecuencia.text 	= success.data.attributes.frequency_index;
 						$scope.accidentalness.gravedad.text 	= success.data.attributes.gravity_index;
 					}
 				}
			} 
			else 
			{
				$log.error(success);
			}
 		}, function(error) {
 			$log.error(error);
 			if (error.status === 401) {
 				Utils.refreshToken($scope.getAccidentalness);
 			}
 		});
 	};

 	$scope.editGeneric = function(idObject) {
		if ($scope.elements.buttons.editUser.text === 'Editar') 
		{
			$scope.elements.buttons.editUser.text = 'Guardar';
			$scope.elements.buttons.editUser.border = '';
			$scope.elements.buttons.removeUser.disabled = true;
			enableFormInputs();
		} 
		else 
		{
			$scope.elements.buttons.editUser.text = 'Editar';
			$scope.elements.buttons.editUser.border = 'btn-border';
			disableFormInputs();
			var aux = { 
						data: { 
							type: 'accident_rates', 
							id: idObject, 
							attributes: 
							{
								month: $scope.accidentalness.fecha.mes,
								year: $scope.accidentalness.fecha.ano,
								worker_average: $scope.accidentalness.trabajadores.text,
								man_hours: $scope.accidentalness.hh.text,
								num_accidents: $scope.accidentalness.accidentes.text,
								num_days_lost: $scope.accidentalness.diasPerdidos.text,
								accident_rate: $scope.accidentalness.accidentabilidad.text,
								casualty_rate: $scope.accidentalness.siniestralidad.text
							}, 
							relationships: { 
								construction: { 
									data: { 
										type: "constructions", 
										id: $scope.accidentalness.obra.id
									} 
								} 
							} 
						} , accidentId: idObject };

			Accidents.update(aux, 
				function(success) {
					if (success.data) {
						$scope.elements.alert.title = 'Se han actualizado los datos de accidentabilidad y siniestralidad';
						$scope.elements.alert.text = '';
						$scope.elements.alert.color = 'success';
						$scope.elements.alert.show = true;
						$scope.getAccidentalness(idObject);

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
			$scope.elements.alert.title = '¿Seguro que desea eliminar la Accidentabilidad/Siniestralidad?';
			$scope.elements.alert.text = 'Para eliminarla vuelva a presionar el botón.';
			$scope.elements.alert.color = 'danger';

			$scope.elements.buttons.editUser.disabled = true;

		} else {
			$scope.elements.buttons.removeUser.text = 'Eliminar';

			Accidents.delete({
				accidentId: idObject
			}, function(success) {

				$uibModalInstance.close({
					action: 'removeGeneric',
					accidentId: idObject
				});

			}, function(error) {
				$log.log(error);
				if (error.status == 401) {
					Utils.refreshToken($scope.removeGeneric);
				}
			});
		}

	};

	var enableFormInputs = function() {
		$scope.accidentalness.trabajadores.disabled 		= false;
		$scope.accidentalness.hh.disabled 					= false;
		$scope.accidentalness.accidentes.disabled 			= false;
		$scope.accidentalness.diasPerdidos.disabled 		= false;
		$scope.accidentalness.siniestralidad.disabled 		= false;
		$scope.accidentalness.accidentabilidad.disabled 	= false;
	};

	var disableFormInputs = function() {
		$scope.accidentalness.trabajadores.disabled 		= true;
		$scope.accidentalness.hh.disabled 					= true;
		$scope.accidentalness.accidentes.disabled 			= true;
		$scope.accidentalness.diasPerdidos.disabled 		= true;
		$scope.accidentalness.siniestralidad.disabled 		= true;
		$scope.accidentalness.accidentabilidad.disabled 	= true;
	};

	$scope.hideAlert = function() {
		$scope.elements.alert.show = false;
		$scope.elements.alert.title = '';
		$scope.elements.alert.text = '';
		$scope.elements.alert.color = '';
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.getAccidentalness(idObject);

})

.controller('newAccidentalnessMasiveinstance', function($scope, Utils, $log, $uibModalInstance, $uibModal, 
														CsvAccidentalness) {
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

		CsvAccidentalness.upload(form)
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
			controller: 'SummaryAccidentalnessInstance',
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

.controller('SummaryAccidentalnessInstance', function($scope, $log, $uibModalInstance, data) {

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