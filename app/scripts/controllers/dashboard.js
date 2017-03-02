'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:GenricDashboardCtrl
 * @description
 * # GenricDashboardCtrl
 * Controller of the efindingAdminApp
 */
 angular.module('efindingAdminApp')
 .controller('GenericDashboardCtrl', function($scope, $filter, $log, $moment, Utils, NgTableParams, Dashboard, Companies, Constructions, Users, NgMap) {
 	var currentDate = new Date();
 	var firstMonthDay = new Date();
 	firstMonthDay.setDate(1);

 	$scope.page = {
 		title: 'Dashboard',
 		filters: {
 			companies: {
 				list: [],
 				selected: null
 			},
 			constructions: {
 				list: [],
 				selected: null,
 				disabled: false
 			},
 			status: {
 				list: [],
 				selected: null,
 				disabled: false
 			},
 			supervisor: {
 				list: [],
 				selected: null,
 				disabled: false
 			},
 			month: {
 				value: new Date(),
 				isOpen: false
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
 					startDate: firstMonthDay,
 					endDate: currentDate
 				}
 			}
 		},
 		buttons: {
 			getExcel: {
 				disabled: false
 			}
 		},
 		loader: {
 			show: false
 		},
 		charts: {
			actividadVsRiesgo: {
				loaded: false,
				table: {
					headers: [],
					row1: [],
					row2: [],
					row3: []
				},
				chartConfig: Utils.setChartConfig('column', 400, {}, {}, {}, [])
			},
			lastWeekComparison: {
				loaded: false,
				table: {
					lastWeekOfYearName: 0,
					currentWeekOfYearName: 0,
					headers: [],
					row1: [],
					row2: [],
					row3: []
				},
				chartConfig: Utils.setChartConfig('column', 400, {}, {}, {}, []),
				lastWeekOfYear: null,
				currentWeekOfYear: null
			},
			weeklySalesComparison: {
				loaded: false,
				table: {
					lastYearName: 0,
					currentYearName: 0,
					headers: [],
					row1: [],
					row2: [],
					row3: []
				},
				chartConfig: Utils.setChartConfig('column', 400, {}, {}, {}, []),
				lastYear: null,
				currentYear: null

			},
			monthlySalesComparison: {
				loaded: false,
				table: {
					lastYearName: 0,
					currentYearName: 0,
					headers: [],
					row1: [],
					row2: [],
					row3: []
				},
				chartConfig: Utils.setChartConfig('column', 400, {}, {}, {}, []),
				lastYear: null,
				currentYear: null

			}
		},
		markers: {
			resolved: [],
			unchecked: []
		}
 	};

 	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

 	var storesIncluded = [],
 	i = 0,
 	j = 0,
 	k = 0;

 	var getCompanies = function() {
 		$scope.page.filters.companies.list = [];

 		Companies.query({}, function(success) {
 			if (success.data) {
 				$scope.page.filters.companies.list.push({
 					id: '',
 					name: 'Todas las Empresas',
 					companiesIds: []
 				});

 				angular.forEach(success.data, function(value, key) {
 					$scope.page.filters.companies.list.push({
 						id: parseInt(value.id),
 						name: value.attributes.name,
 						dealersIds: value.attributes.dealer_ids
 					});
 				});

 				$scope.page.filters.companies.selected = $scope.page.filters.companies.list[0];
 				$scope.getConstructions({
 					success: true,
 					detail: 'OK'
 				}, $scope.page.filters.companies.selected);
 				$scope.page.filters.constructions.disabled = true;

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

 	$scope.getConstructions = function(e, companySelected) {

 		$scope.page.filters.constructions.selected = [];
 		$scope.page.filters.constructions.list = [];
 		Constructions.query({
 			'filter[company_id]': companySelected.id
 		}, function(success) {
 			if (success.data) {

 				$scope.page.filters.constructions.list.push({
 					id: '',
 					name: 'Todas las obras'
 				});

 				for (i = 0; i < success.data.length; i++) {
 					$scope.page.filters.constructions.list.push({
 						id: parseInt(success.data[i].id),
 						name: $filter('capitalize')(success.data[i].attributes.name, true),
 						type: 'dealers'
 					});
 				}

 				$scope.page.filters.constructions.selected = $scope.page.filters.constructions.list[0];
 				$scope.page.filters.constructions.disabled = false;

 				$scope.getStatus({
 					success: true,
 					detail: 'OK'
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

 	$scope.getStatus = function(e) {

 		$scope.page.filters.status.selected = [];
 		$scope.page.filters.status.list = [];

		$scope.page.filters.status.list.push({
			name: '',
			nameB: 'Todos los estados'
		});

		$scope.page.filters.status.list.push({
			name: 'reports_pending',
			nameB: 'Pendiente de envío'
		});
		$scope.page.filters.status.list.push({
			name: 'first_signature_pending',
			nameB: 'Pendiente de firma'
		});
		$scope.page.filters.status.list.push({
			name: 'first_signature_done',
			nameB: 'Firmado'
		});
		$scope.page.filters.status.list.push({
			name: 'final_signature_pending',
			nameB: 'Pendiente de firma final'
		});
		$scope.page.filters.status.list.push({
			name: 'finished',
			nameB: 'Teminado'
		});

		$scope.page.filters.status.selected = $scope.page.filters.status.list[0];
		$scope.page.filters.status.disabled = false;

		getUsers({
			success: true,
			detail: 'OK'
		});
 	};

 	var getUsers = function(e) {

 		$scope.page.filters.supervisor.selected = [];
 		$scope.page.filters.supervisor.list = [];

 		Users.query({}, function(success) {
 			if (success.data) {

 				$scope.page.filters.supervisor.list.push({
 					id: '',
 					name: 'Todos los supervisores'
 				});

 			angular.forEach(success.data, function(value, key) {
	          if (value.attributes.role_id === 1) { // supervisor
	          	$scope.page.filters.supervisor.list.push({
	          		id: parseInt(value.id),
	          		name: value.attributes.first_name + ' ' + value.attributes.last_name
	          	});
	          }
	      	});

 				$scope.page.filters.supervisor.selected = $scope.page.filters.supervisor.list[0];
 				$scope.page.filters.supervisor.loaded = true;

 			} else {
 				$log.error(success);
 			}
 		}, function(error) {
 			$log.error(error);
 			if (error.status === 401) {
 				Utils.refreshToken(getUsers);
 			}
 		});
 	};

 	$scope.$watch('page.filters.supervisor.loaded', function() {
		if ($scope.page.filters.supervisor.loaded) {
			$scope.$watch('page.filters.dateRange.date', function(newValue, oldValue) {
				var startDate = new Date($scope.page.filters.dateRange.date.startDate);
				var endDate = new Date($scope.page.filters.dateRange.date.endDate);

				if (startDate.getMonth() !== endDate.getMonth()) {
					openModalMessage({
						title: 'Error en el rango de fechas ',
						message: 'El rango de fechas debe estar dentro del mismo mes.'
					});

					$scope.page.filters.dateRange.date.startDate = new Date(oldValue.startDate);
					$scope.page.filters.dateRange.date.endDate = new Date(oldValue.endDate);
					return;
				}

				$scope.getDashboardInfo({
					success: true,
					detail: 'OK'
				});
			});
		}
	});

	var openModalMessage = function(data) {
		var modalInstance = $uibModal.open({
			animation: true,
			backdrop: true,
			templateUrl: 'messageModal.html',
			controller: 'MessageModalInstance',
			size: 'md',
			resolve: {
				data: function() {
					return data;
				}
			}
		});

		modalInstance.result.then(function() {}, function() {});
	};

 	$scope.getDashboardInfo = function(e) {
 		if (!e.success) {
 			$log.error(e.detail);
 			return;
 		}


 		var companyIdSelected = $scope.page.filters.companies.selected ? $scope.page.filters.companies.selected.id : '';
 		var constructionIdSelected = $scope.page.filters.constructions.selected ? $scope.page.filters.constructions.selected.id : '';
 		var statusIdSelected = $scope.page.filters.status.selected ? $scope.page.filters.status.selected.name : '';
 		var supervisorIdSelected = $scope.page.filters.supervisor.selected ? $scope.page.filters.supervisor.selected.id : '';
 		var startDate = new Date($scope.page.filters.dateRange.date.startDate);
 		var endDate = new Date($scope.page.filters.dateRange.date.endDate);

 		Dashboard.query({
 			'filter[construction][id]': constructionIdSelected,
 			'filter[construction][company][id]': companyIdSelected,
 			'filter[state_name]': statusIdSelected,
 			'filter[creator][id]': supervisorIdSelected,
 			'filter[start_date]': startDate,
 			'filter[end_date]': endDate
 		}, function(success) {
		    if (success.data) {
		    	var actividadVsRiesgo = {
					categories: [],
					riesgo: []
				},
				cumplimientoHallazgos = {
					inspeccion: [],
					datos: []
				};

				// INI grado de riesgo
				angular.forEach(success.data.attributes.grupos_actividad, function(value, key) {
					actividadVsRiesgo.categories.push($filter('capitalize')(value, true));
				});
				angular.forEach(success.data.attributes.grados_riesgo, function(value, key) {
					var aux = {name: 'Grado ' + value, data: []};
					actividadVsRiesgo.riesgo.push(aux);
				});
				for (var i = 0; i < actividadVsRiesgo.riesgo.length; i++) {
					for (var j = 0; j < success.data.attributes.grupos_actividad_vs_riesgo.length; j++) {
						actividadVsRiesgo.riesgo[i].data.push(success.data.attributes.grupos_actividad_vs_riesgo[j][i]);
					}
				}

				$scope.page.charts.actividadVsRiesgo.chartConfig = Utils.setChartConfig('column', 400, {}, {
					min: 0,
					title: {
						text: null
					}
				}, {
					categories: actividadVsRiesgo.categories,
					title: {
						text: 'Grupos de actividad'
					}
				}, actividadVsRiesgo.riesgo);

				// FIN grado de riesgo

				//INI cumplimiento de hallazgos

		        angular.forEach(success.data.attributes.report_fulfillment, function(value, key) {
		        	cumplimientoHallazgos.inspeccion.push(value.inspection_id);
		        });
		        cumplimientoHallazgos.datos.push({name: "No revisados", data:[]})
		        cumplimientoHallazgos.datos.push({name: "Resueltos", data:[]})
		        cumplimientoHallazgos.datos.push({name: "Pendientes", data:[]})

		        for (var i = 0; i < success.data.attributes.report_fulfillment.length; i++) {
		        	cumplimientoHallazgos.datos[0].data.push(success.data.attributes.report_fulfillment[i].num_unchecked);
		        	cumplimientoHallazgos.datos[1].data.push(success.data.attributes.report_fulfillment[i].num_resolved);
		        	cumplimientoHallazgos.datos[2].data.push(success.data.attributes.report_fulfillment[i].num_pending);
				}

				$scope.charCumplimientoHallazgos = Utils.setChartConfig('column', 513, {
			    	column: {
			    		stacking: 'normal',
			    		dataLabels: {
			    			enabled: true,
			    			color: 'white',
			    			style: {
			    				textShadow: '0 0 3px black',
			    				fontWeight: 'normal'
			    			}
			    		}
			    	}
			    }, 
			    {
			    	min: 0,
			    	title: {
			    		text: null
			    	},
			    	stackLabels: {
			    		enabled: true,
			    		style: {
			    			fontWeight: 'normal',
			    			color: 'gray'
			    		}
			    	}
			    }, 
			    {
	    			categories: cumplimientoHallazgos.inspeccion,
	    			title: {
	    				text: 'Zonas'
	    			}
	    		},cumplimientoHallazgos.datos);
			    //FIN cumplimiento de hallazgos

			    //INI ratio de hallazgos
			    $scope.ratioHallazgos = Utils.setChartConfig('pie', 513, {
			    	pie: {
		                allowPointSelect: true,
		                cursor: 'pointer',
		                dataLabels: {
		                    enabled: false
		                },
		                showInLegend: true
		            }
			    }, 
			    {
			    	min: 0,
			    	title: {
			    		text: null
			    	},
			    	stackLabels: {
			    		enabled: true,
			    		style: {
			    			fontWeight: 'normal',
			    			color: 'gray'
			    		}
			    	}
			    }, 
			    {
	    			categories: cumplimientoHallazgos.inspeccion,
	    			title: {
	    				text: 'Zonas'
	    			}
	    		}, 
	    		[
	    			{
			        	name: 'Número Hallazgos',
			        	colorByPoint: true,
				        data: [{
				            name: 'Pendientes',
				            y: success.data.attributes.report_ratios[0].num_reports
				        }, {
				            name: 'Resueltos',
				            y: success.data.attributes.report_ratios[1].num_reports
				        }]
			    	}
			    ]
			    );

			    //INI MAPA
			    $scope.page.markers.unchecked = success.data.attributes.report_locations[0].coordinates;
				$scope.page.markers.resolved = success.data.attributes.report_locations[1].coordinates;
			    //FIN MAPA
    		}
		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getDashboardInfo);
			}
		});
	};
	getCompanies();
});