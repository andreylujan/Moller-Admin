'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:ReportsListCtrl
 * @description
 * # ReportsListCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('ReportsListCtrl', function($scope, $log, $filter, $window, $timeout, $uibModal, NgTableParams, Inspections, Activities, Utils) {

	$scope.page = {
		title: 'Lista de inspecciones',
		prevBtn: {
			disabled: true
		},
		nextBtn: {
			disabled: false
		}
	};

	$scope.pagination = {
		pages: {
			current: 1,
			total: 0,
			size: 100
		}
	};

	var data = [],
		activityTypes = [],
		users = [],
		reportsIncluded = [],
		inspecciones = [];

	var receiverName = null,
		equipmentId = null,
		activityTypeId = null,
		assignedUserId = null,
		state = '',
		i = 0,
		j = 0,
		k = 0,
		filterTimeout = null,
		filterTimeoutDuration = 1000;

	$scope.columns = Utils.getInStorage('report_columns');
	$log.error($scope.columns);

	$scope.filter = {};

	for (i = 0; i < $scope.columns.length; i++) {

		if ($scope.columns[i].relationshipName) {
			//if (!_.contains($scope.columns[i].relationshipName, '.')) {
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'] = {};
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].filter = '';
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].field = $scope.columns[i].field;
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].name = $scope.columns[i].field;
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].columnName = $scope.columns[i].title;
				$scope.filter['filter[' + $scope.columns[i].relationshipName + ']' + '[' + $scope.columns[i].field + ']'].relationshipName = $scope.columns[i].relationshipName;
			/*}
			else
			{
				var aux = $scope.columns[i].relationshipName.split('.');
				var texto = 'filter';
				for (var j = 0; j <= aux.length -1; j++) {
					texto = texto + '[' + aux[j] + ']';
				}
				$scope.filter[texto] = {};
				$scope.filter[texto].filter = '';
				$scope.filter[texto].field = $scope.columns[i].field;
				$scope.filter[texto].name = $scope.columns[i].field;
				$scope.filter[texto].columnName = $scope.columns[i].title;
				$scope.filter[texto].relationshipName = $scope.columns[i].relationshipName;
			}*/

		} else {
			var res = $scope.columns[i].field.split(".");
			var auxiliar = 'filter';

			for (j = 0; j < res.length; j++) {
				auxiliar = auxiliar+'['+ res[j]+']';
			}
			$scope.filter[auxiliar] = {};
			$scope.filter[auxiliar].filter = '';
			$scope.filter[auxiliar].field = $scope.columns[i].field;
			$scope.filter[auxiliar].name = $scope.columns[i].name;
			$scope.filter[auxiliar].columnName = $scope.columns[i].title;
			$scope.filter[auxiliar].relationshipName = $scope.columns[i].relationshipName;
		}
		$scope.filter.include = 'creator,construction,company';
		$scope.filter['page[number]'] = $scope.pagination.pages.current;
		$scope.filter['page[size]'] = $scope.pagination.pages.size;

	}

	$scope.columns2 = [];
	for (var attr in $scope.filter) {
		if (attr.indexOf('filter') !== -1) {

			$scope.columns2.push({
				visible: true,
				filter: attr,
				field: $scope.filter[attr].field,
				name: $scope.filter[attr].name,
				title: $scope.filter[attr].columnName,
				relationshipName: $scope.filter[attr].relationshipName
			});
		}
	}

	$log.error('$scope.columns2');
	$log.error($scope.columns2);

	$log.log('$scope.filter');
	$log.log($scope.filter);

	$scope.$watch('filter', function(newFilters) {
		if (filterTimeout) {
			$timeout.cancel(filterTimeout);
		}

		filterTimeout = $timeout(function() {
			$log.log(newFilters);

			$scope.getInspections({
				success: true,
				detail: 'OK'
			}, $scope.pagination.pages.current, $scope.filter);

		}, filterTimeoutDuration);
	}, true);

	$scope.getInspections = function(e, page, filters) {
		if (!e.success) {
			$log.error(e.detail);
			return;
		}

		data = [];

		var test = [];

		var filtersToSearch = {};
		for (var attr in filters) {
			if (attr.indexOf('filter') !== -1) {
				filtersToSearch[attr] = filters[attr].filter;
			} else {
				filtersToSearch[attr] = filters[attr];
			}
		}

		Inspections.query(filtersToSearch, function(success) {
			$log.info('success');
			$log.info(success);
			reportsIncluded = success.included;
			$scope.pagination.pages.total = success.meta.page_count;

			for (i = 0; i < success.data.length; i++) {

				test.push({});

				for (j = 0; j < $scope.columns2.length; j++) {
					test[test.length - 1].title = $scope.columns2[j].title;
					test[test.length - 1].id = success.data[i].id;
					test[test.length - 1].state = success.data[i].attributes.state;
					test[test.length - 1][$scope.columns2[j].relationshipName + '_id'] = success.data[i].attributes[$scope.columns2[j].relationshipName + '_id'];
					test[test.length - 1].relationships = success.data[i].relationships;
					test[test.length - 1].pdf = success.data[i].attributes.pdf;
					test[test.length - 1].pdfUploaded = success.data[i].attributes.pdf_uploaded;

					if (success.data[i].attributes[$scope.columns2[j].field]) {
						test[test.length - 1][$scope.columns2[j].field] = success.data[i].attributes[$scope.columns2[j].field];
						test[test.length - 1][$scope.columns2[j].name] = success.data[i].attributes[$scope.columns2[j].field];
					} 
					else 
					{
						var res = $scope.columns2[j].field.split(".");

						if (res.length === 1) 
						{
							// Solo tiene una relacion con un objeto
							if ($scope.columns2[j].relationshipName !== null) //&& (success.included.length > i) 
							{	
								if (success.data[i].relationships[$scope.columns2[j].relationshipName].data !== null) 
								{
									test[test.length - 1][$scope.columns2[j].name] = '-';

									for (var x = 0; x < success.included.length; x++) 
									{
										//$log.error('nuevo');
										//$log.error(success.data[i].relationships[$scope.columns2[j].relationshipName]);
										//$log.error($scope.columns2[j]);
										if (success.included[x].id === success.data[i].relationships[$scope.columns2[j].relationshipName].data.id &&
											success.included[x].type === success.data[i].relationships[$scope.columns2[j].relationshipName].data.type) 
										{
											test[test.length - 1][$scope.columns2[j].name] = success.included[x].attributes[$scope.columns2[j].name];
										}
									}
								}
								else
								{
									test[test.length - 1][$scope.columns2[j].name] = '-';
								}
							}
							else
							{
								test[test.length - 1][$scope.columns2[j].name] = '-';
							}
						}
						else if (res.length > 2) 
						{
							// Llama a un dynamic_attribute 
							var aux = res;
							var flag = success.data[i].attributes.dynamic_attributes;

							//valida que existe el objeto dentro de los dynamic_attributes
							if (flag.hasOwnProperty(aux[1])) 
							{
								//Valida que exista el objeto text
								if (flag[aux[1]].hasOwnProperty('text')) 
								{
									test[test.length - 1][$scope.columns2[j].field] = flag[aux[1]].text;
									test[test.length - 1][$scope.columns2[j].name] = flag[aux[1]].text;
								}
								else
								{
									test[test.length - 1][$scope.columns2[j].field] = '-';
									test[test.length - 1][$scope.columns2[j].name] = '-';
								}
							}
							else
							{
								test[test.length - 1][$scope.columns2[j].field] = '-';
								test[test.length - 1][$scope.columns2[j].name] = '-';
							}
							
						}
						else
						{
							test[test.length - 1][$scope.columns2[j].field] = '';
							test[test.length - 1][$scope.columns2[j].name] = '';
						}

					}

				}
			}

			for (i = 0; i < test.length; i++) {

				for (j = 0; j < $scope.columns2.length; j++) {

					if (test[i][$scope.columns2[j].field] === '') {

						var seRelacionaCon = $scope.columns2[j].relationshipName;

						if (seRelacionaCon) {

							if (test[i].relationships[$scope.columns2[j].relationshipName].data) {

								var tipoRelacionado = test[i].relationships[$scope.columns2[j].relationshipName].data.type;
								var idRelacionado = test[i].relationships[$scope.columns2[j].relationshipName].data.id;

								for (k = 0; k < reportsIncluded.length; k++) {

									if (reportsIncluded[k].type === tipoRelacionado && (parseInt(reportsIncluded[k].id) === parseInt(idRelacionado))) {

										test[i][$scope.columns2[j].field] = reportsIncluded[k].attributes[$scope.columns2[j].field];
										test[i][$scope.columns2[j].name] = reportsIncluded[k].attributes[$scope.columns2[j].field];

									}

								}

							}

						}

					}

				}

			}

			$log.error('test');
			$log.error(test);
			inspecciones = test;

			$scope.tableParams = new NgTableParams({
				page: 1, // show first page
				count: 25, // count per page
				sorting: {
					'finishedAt': 'desc' // initial sorting
				}
			}, {
				counts: [],
				total: test.length, // length of test
				dataset: test
			});

		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getInspections);
			}
		});
	};



	var getActivityTypes = function() {
		activityTypes = [];

		Activities.query({
			idActivity: ''
		}, function(success) {

			if (success.data) {
				activityTypes = [];
				for (var i = 0; i < success.data.length; i++) {
					activityTypes.push({
						id: success.data[i].id,
						name: success.data[i].attributes.name
					});
				}

			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
		});
	};

	$scope.downloadPdf = function(event) {
		var pdf = angular.element(event.target).data('pdf');
		if (pdf) {
			$window.open(pdf, '_blank');
		}
	};

	$scope.openModalDownloadPdfs = function() {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'modalDownloadPdfs.html',
			controller: 'DownloadPdfsModalInstance',
			resolve: {}
		});

		modalInstance.result.then(function() {}, function() {});
	};

	$scope.incrementPage = function() {
		if ($scope.pagination.pages.current <= $scope.pagination.pages.total - 1) {
			$scope.pagination.pages.current++;
			$scope.getInspections({
				success: true
			}, $scope.pagination.pages.current);
		}
	};

	$scope.decrementPage = function() {
		if ($scope.pagination.pages.current > 1) {
			$scope.pagination.pages.current--;
			$scope.getInspections({
				success: true
			}, $scope.pagination.pages.current);
		}
	};

	$scope.getInspections({
		success: true,
		detail: 'OK'
	}, $scope.pagination.pages.current, $scope.filter);

	$scope.FirmaInspeccionInstance = function(idInspection) {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'firmarInspeccion.html',
			controller: 'FirmaInspeccionInstance',
			resolve: {
				idInspection: function() {
					return idInspection;
				}
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'removeUser') {
				for (var i = 0; i < data.length; i++) {
					if (data[i].id === datos.idUser) {
						data.splice(i, 1);
					}
				}
			}
			if (datos.action === 'firma') {
				$scope.getInspections({
					success: true,
					detail: 'OK'
				}, $scope.pagination.pages.current, $scope.filter);
			}
			$scope.tableParams.reload();
		}, function() {});
	};

})

.controller('FirmaInspeccionInstance', function($scope, $log, $uibModalInstance, Firmar, idInspection, Inspections, Validators, Utils) {

	$scope.inspection = {
		id: null,
		empresa: {
			text: ''
		},
		obra: {
			text: ''
		},
		creador: {
			text: ''
		},
		fecha_creacion: {
			text: ''
		},
		fecha_resolucion: {
			text: ''
		},
		id: {
			id: ''
		}
		,
		pdf: ''
	};
	$scope.elements = {
		buttons: {
			firmar: {
				text: 'Firmar',
				border: 'btn-border',
				disabled: true
			},
			ver: {
				text: 'Ver Inspección',
				border: 'btn-border',
				disabled: true
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
		$uibModalInstance.close();
	};

	$scope.validaFirma = function(check) 
	{
		if ($scope.elements.buttons.firmar.disabled == true) 
		{
			$scope.elements.buttons.firmar.disabled = false
		}
		else
		{
			$scope.elements.buttons.firmar.disabled = true
		}
	};

	$scope.getInspectionDetail = function(idInspection) {
		Inspections.detail({
			idInspection: idInspection
		}, function(success) {
			if (success.data) {
				var datos = _.groupBy(success.included, function(objeto){ return objeto.type; });
				$scope.inspection.empresa.text = datos.companies[0].attributes.name;
				$scope.inspection.obra.text = datos.constructions[0].attributes.name;
				$scope.inspection.creador.text = datos.users[0].attributes.full_name;
				$scope.inspection.fecha_creacion.text = success.data.attributes.created_at;
				$scope.inspection.id.id = success.data.id;
				$scope.inspection.pdf = success.data.attributes.pdf;

			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
			if (error.status == 401) 
			{
				Utils.refreshToken(getInspectionDetail);
			}
		});

	};

	$scope.getInspectionDetail(idInspection);

	$scope.firmar = function(idInspection) {

		if ($scope.elements.buttons.firmar.disabled === false) {
			$log.error(idInspection);


			Firmar.save({
				idInspection: idInspection
			}, function(success) {
				if (success.data) {
					$scope.elements.alert.title = 'Se ha firmado el documento';
					$scope.elements.alert.text = '';
					$scope.elements.alert.color = 'success';
					$scope.elements.alert.show = true;
					$uibModalInstance.close({
						action: 'firma',
						success: success
					});

				} else {
					$log.log(success);
				}
			}, function(error) {
				$log.error(error);
				if (error.status == 401) 
				{
					Utils.refreshToken(firmar);
				}
			 	$scope.elements.alert.color = 'danger';
			 	Utils.gotoAnyPartOfPage('pageHeader');
			 	$scope.elements.alert.title = 'Error al firmar el documento: ';
			 	$scope.elements.alert.text = error.statusText;
			 	$scope.elements.alert.show = true;
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

.controller('DownloadPdfsModalInstance', function($scope, $log, $timeout, $moment, $uibModalInstance, Equipments, Reports, Utils, GetPdfsZip) {

	$scope.modal = {
		alert: {
			color: null,
			show: null,
			title: null,
			text: null
		},
		clients: {
			list: [],
			selected: {}
		},
		executers: {
			list: [],
			selected: []
		},
		territories: {
			list: [],
			selected: []
		},
		equipments: {
			list: [],
			selected: {}
		},
		classes: {
			list: [],
			selected: {}
		},
		dropdownMultiselect: {
			settings: {
				enableSearch: true,
				displayProp: 'name',
				scrollable: true,
				scrollableHeight: 300,
				externalIdProp: '',
				showCheckAll: true,
				showUncheckAll: true
			},
			texts: {
				checkAll: 'Seleccionar todos',
				uncheckAll: 'Desmarcar todos',
				searchPlaceholder: 'Buscar',
				buttonDefaultText: 'Seleccionar',
				dynamicButtonTextSuffix: 'seleccionados'
			}
		},
		dateRange: {
			options: {
				locale: {
					format: 'DD/MM/YYYY',
					applyLabel: 'Buscar',
					cancelLabel: 'Cerrar',
					fromLabel: 'Desde',
					toLabel: 'Hasta',
					customRangeLabel: 'Personalizado',
					daysOfWeek: ['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vie', 'Sab'],
					monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
					firstDay: 1
				},
				autoApply: true,
				maxDate: $moment().add(1, 'months').date(1).subtract(1, 'days'),
			},
			date: {
				startDate: new Date(),
				endDate: new Date()
			}
		}
	};

	var creatorsDuplicates = [],
		activityTypesDuplicates = [],
		serialNumbersDuplicates = [],
		configurationElementsDuplicates = [],
		alternativeIdsDuplicates = [],
		modelsDuplicates = [],
		territoriesDuplicates = [],
		classesDuplicates = [],
		clientsDuplicates = [];

	$scope.creatorsUnique = [];
	$scope.activityTypesUnique = [];
	$scope.serialNumbersUnique = [];
	$scope.configurationElementsUnique = [];
	$scope.alternativeIdsUnique = [];
	$scope.modelsUnique = [];
	$scope.territoriesUnique = [];
	$scope.classesUnique = [];
	$scope.clientsUnique = [];

	var createdAtRange = [],
		limitDateRange = [],
		finishedAtRange = [],
		i = 0,
		j = 0,
		k = 0,
		reports = [],
		reportsIncluded = [];

	var getInspections = function(e) {
		if (!e.success) {
			$log.error(e.detail);
			return;
		}

		Reports.query({
			include: 'creator,report_type,equipment,activity_type,assigned_user',
			'fields[users]': 'full_name,email',
			all: true
		}, function(success) {

			reports = success.data;
			reportsIncluded = success.included;

			if (!success.data || !success.included) {
				$log.error(success);
				return;
			}

			// $log.info(success);

			angular.forEach(success.included, function(value, key) {

				if (value.type === 'users') {
					creatorsDuplicates.push({
						id: parseInt(value.id),
						email: value.attributes.email,
						name: value.attributes.full_name
					});
				}
				if (value.type === 'activity_types') {
					activityTypesDuplicates.push({
						id: parseInt(value.id),
						name: value.attributes.name
					});
				}
				if (value.type === 'equipments') {
					if (value.attributes.serial_number) {
						serialNumbersDuplicates.push(value.attributes.serial_number);
					}
					if (value.attributes.configuration_element) {
						configurationElementsDuplicates.push(value.attributes.configuration_element);
					}
					if (value.attributes.alternative_id) {
						alternativeIdsDuplicates.push(value.attributes.alternative_id);
					}
					if (value.attributes.equipment_model) {
						modelsDuplicates.push(value.attributes.equipment_model);
					}
					if (value.attributes.territory) {
						territoriesDuplicates.push(value.attributes.territory);
					}
					if (value.attributes.equipment_class) {
						classesDuplicates.push(value.attributes.equipment_class);
					}
					if (value.attributes.client) {
						clientsDuplicates.push(value.attributes.client);
					}
				}

			});

			if (success.data[0].attributes.created_at) {
				createdAtRange = [success.data[0].attributes.created_at, success.data[0].attributes.created_at];
			}
			if (success.data[0].attributes.limit_date) {
				limitDateRange = [success.data[0].attributes.limit_date, success.data[0].attributes.limit_date];
			}
			if (success.data[0].attributes.finished_at) {
				finishedAtRange = [success.data[0].attributes.finished_at, success.data[0].attributes.finished_at];
			}

			angular.forEach(success.data, function(value, key) {
				if (value.attributes.created_at) {
					if ($moment(value.attributes.created_at).diff($moment(createdAtRange[0])) < 0) {
						createdAtRange[0] = value.attributes.created_at;
					}
					if ($moment(value.attributes.created_at).diff($moment(createdAtRange[1])) > 0) {
						createdAtRange[1] = value.attributes.created_at;
					}
				}
				if (value.attributes.limit_date) {
					if ($moment(value.attributes.limit_date).diff($moment(limitDateRange[0])) < 0) {
						limitDateRange[0] = value.attributes.limit_date;
					}
					if ($moment(value.attributes.limit_date).diff($moment(limitDateRange[1])) > 0) {
						limitDateRange[1] = value.attributes.limit_date;
					}
				}
				if (value.attributes.finished_at) {
					if ($moment(value.attributes.finished_at).diff($moment(finishedAtRange[0])) < 0) {
						finishedAtRange[0] = value.attributes.finished_at;
					}
					if ($moment(value.attributes.finished_at).diff($moment(finishedAtRange[1])) > 0) {
						finishedAtRange[1] = value.attributes.finished_at;
					}
				}
			});

			$scope.modal.dateRange.date.startDate = createdAtRange[0];
			$scope.modal.dateRange.date.endDate = new Date();

			$scope.modal.executers.list = _.uniq(creatorsDuplicates, function(item, key, id) {
				return item.id;
			});

			$scope.activityTypesUnique = _.uniq(activityTypesDuplicates, function(item, key, id) {
				return item.id;
			});
			$scope.activityTypeSelected = $scope.activityTypesUnique[0];

			$scope.serialNumbersUnique = _.uniq(serialNumbersDuplicates);
			$scope.configurationElementsUnique = _.uniq(configurationElementsDuplicates);
			$scope.alternativeIdsUnique = _.uniq(alternativeIdsDuplicates);
			$scope.modelsUnique = _.uniq(modelsDuplicates);
			$scope.territoriesUnique = _.uniq(territoriesDuplicates);
			$scope.classesUnique = _.uniq(classesDuplicates);
			$scope.clientsUnique = _.uniq(clientsDuplicates);

			$scope.modal.equipments.selected = $scope.modal.equipments.list[0];

			for (var i = 0; i < $scope.clientsUnique.length; i++) {
				$scope.modal.clients.list.push({
					id: i,
					name: $scope.clientsUnique[i]
				});
			}
			$scope.modal.clients.selected = $scope.modal.clients.list[0];

			for (i = 0; i < $scope.classesUnique.length; i++) {
				$scope.modal.classes.list.push({
					id: i,
					name: $scope.classesUnique[i]
				});
			}
			$scope.modal.classes.selected = $scope.modal.classes.list[0];


			for (i = 0; i < $scope.territoriesUnique.length; i++) {
				$scope.modal.territories.list.push({
					id: i,
					name: $scope.territoriesUnique[i]
				});

			}
			for (i = 0; i < $scope.modal.territories.list.length; i++) {
				$scope.modal.territories.selected.push($scope.modal.territories.list[i]);
			}
		}, function(error) {
			$log.log(error);
			if (error.status === 401) {
				Utils.refreshToken(getInspections);
			}
		});
	};

	$scope.downloadZip = function() {

		var equipmentsSelected = [];
		$log.log($scope.modal.clients.selected.name);
		$log.log($scope.modal.classes.selected.name);

		for (i = 0; i < reportsIncluded.length; i++) {
			for (j = 0; j < $scope.modal.territories.selected.length; j++) {

				if (reportsIncluded[i].type === 'equipments' &&
					reportsIncluded[i].attributes.client === $scope.modal.clients.selected.name &&
					reportsIncluded[i].attributes.equipment_class === $scope.modal.classes.selected.name &&
					reportsIncluded[i].attributes.territory === $scope.modal.territories.selected[j].name
				) {

					equipmentsSelected.push(parseInt(reportsIncluded[i].id));

				}

			}
		}

		var reportsIds = [];

		for (i = 0; i < reports.length; i++) {

			for (j = 0; j < equipmentsSelected.length; j++) {
				for (k = 0; k < $scope.modal.executers.selected.length; k++) {

					if (reports[i].attributes.state_name === 'Ejecutado' &&
						$moment(Date.parse(reports[i].attributes.created_at)).isAfter(Date.parse($scope.modal.dateRange.date.startDate)) &&
						$moment(Date.parse(reports[i].attributes.created_at)).isBefore(Date.parse($scope.modal.dateRange.date.endDate)) &&
						parseInt(reports[i].attributes.equipment_id) === parseInt(equipmentsSelected[j]) &&
						parseInt(reports[i].attributes.creator_id) === parseInt($scope.modal.executers.selected[k].id) &&
						parseInt(reports[i].attributes.activity_type_id) === parseInt($scope.activityTypeSelected.id)

					) {

						reportsIds.push(reports[i].id);
					}
				}
			}
		}
		$log.info('reportsIds');
		$log.info(reportsIds);

		if (reportsIds.length > 0) {
			$scope.zipBtnDisabled = true;
			GetPdfsZip.getFile('#zipBtn', reportsIds);
			$timeout(function() {
				$scope.zipBtnDisabled = false;
			}, 2000);
		} else {
			$scope.modal.alert.color = 'warning';
			$scope.modal.alert.title = 'No se encontraron inspecciones que cumplan con los filtros';
			$scope.modal.alert.text = '';
			$scope.modal.alert.show = true;
		}


	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.removeMessage = function() {
		$scope.modal.alert.show = false;
	};

	getInspections({
		success: true,
		detail: 'OK'
	});

});