'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:InspectionsDashboardCtrl
 * @description
 * # InspectionsDashboardCtrl
 * Controller of the efindingAdminApp
 */
 angular.module('efindingAdminApp')
 .controller('InspectionsDashboardCtrl', function($scope, $filter, $log, $moment, Utils, 
 	 									Companies, Constructions, DashboardInspections) {
 	
 	$scope.page = {
 		title: 'Inspecciones',
 		filters: {
 			companies: {
 				list: [],
 				selected: null
 			},
 			constructions: {
 				list: [],
 				selected: null,
 				disabled: false,
 				loaded: false
 			},
 			date: {
 				value: new Date(),
 				opened: false
 			}
 		}
 	};

 	$scope.dashboard = 
 	{
 		cantHallazgosGlobales: 0,
 		cantHallazgosGlobalesAltoTotal: 0,
 		cantHallazgosGlobalesMedioTotal: 0,
 		cantHallazgosGlobalesBajoTotal: 0,
 		cumplimientoGlobal: 0,
 		cumplimientoInterno: 0,
 		CumplimientoContratistas: 0,
 		causasDirectas: [],
 		causasBasicas:  [],
 		causasDirectasTotal: 0,
 		causasBasicasTotal: 0
 	};


	$scope.getDashboardInfo = function() {

		var companyIdSelected = $scope.page.filters.companies.selected ? $scope.page.filters.companies.selected.id : '';
 		var constructionIdSelected = $scope.page.filters.constructions.selected ? $scope.page.filters.constructions.selected.id : '';

 		var date = (new Date($scope.page.filters.date.value).getMonth()+1) + '/' + new Date($scope.page.filters.date.value).getFullYear();

 		DashboardInspections.query({
 			'filter[company_id]': companyIdSelected,
 			'filter[construction_id]': constructionIdSelected,
 			'filter[period]': date
 		}, function(success) {
		    if (success.data) {
		    	$scope.dashboard.cantHallazgosGlobales				= 0;
		    	$scope.dashboard.cantHallazgosGlobalesAltoTotal		= 0;
		    	$scope.dashboard.cantHallazgosGlobalesMedioTotal	= 0;
		    	$scope.dashboard.cantHallazgosGlobalesBajoTotal		= 0;
		    	$scope.dashboard.cumplimientoGlobal					= 0;
		    	$scope.dashboard.cumplimientoInterno				= 0;
		    	$scope.dashboard.CumplimientoContratistas			= 0;
		    	$scope.dashboard.causasDirectas						= [];
		    	$scope.dashboard.causasBasicas						= [];
		    	$scope.dashboard.causasDirectasTotal				= 0;
		    	$scope.dashboard.causasBasicasTotal					= 0;


		    	angular.forEach(success.data.attributes.reportes_por_grupo.grados_riesgo, function(grados)
		    	{
		    		angular.forEach(grados.data, function(data)
		    		{	
		    			if (grados.name == 'Alto') 
		    			{
		    				$scope.dashboard.cantHallazgosGlobalesAltoTotal = $scope.dashboard.cantHallazgosGlobalesAltoTotal + data; 
		    			}
		    			if (grados.name == 'Medio') 
		    			{
		    				$scope.dashboard.cantHallazgosGlobalesMedioTotal = $scope.dashboard.cantHallazgosGlobalesMedioTotal + data; 
		    			}
		    		 	if (grados.name == 'Bajo') 
		    			{
		    				$scope.dashboard.cantHallazgosGlobalesBajoTotal = $scope.dashboard.cantHallazgosGlobalesBajoTotal + data; 
		    			}

		    			$scope.dashboard.cantHallazgosGlobales = $scope.dashboard.cantHallazgosGlobales + data;
		    		});
		    	});

		    	//GRAFICO 1
		    	$scope.cantidadHallazgos = Utils.setChartConfig(
 								'column', 
 								null, 
 								{
	        						column: 
	        						{
	            						pointPadding: 0.2,
	            						borderWidth: 0
	        						}
	    						}, 
	    						{
						        	min: 0,
						        	title: {
						            	text: 'Hallazgos'
						        	}
						    	}, 
	    						{
							        categories: success.data.attributes.reportes_por_grupo.grupos_actividad,
							        crosshair: true
							    }, 
							    success.data.attributes.reportes_por_grupo.grados_riesgo
	    					);

		    	//Grafico 2
		    	$scope.cantidadHallazgosDonut = Utils.setChartConfig(
 								'pie', 
 								200, 
 								{
						            pie: {
						                allowPointSelect: true,
						                cursor: 'pointer',
						                dataLabels: {
						                    enabled: false
						                },
						                showInLegend: true
						            }
						        }, 
	    						{}, 
	    						{}, 
	    						[
	    							{
								        name: 'Riesgo',
								        colorByPoint: true,
								        innerSize: '80%',
								        data: [{
								            name: 'Bajo',
								            y: $scope.dashboard.cantHallazgosGlobalesBajoTotal
								        }, {
								            name: 'Medio',
								            y: $scope.dashboard.cantHallazgosGlobalesMedioTotal,
								        }, {
								            name: 'Alto',
								            y: $scope.dashboard.cantHallazgosGlobalesAltoTotal
								        }]
							    	}
							    ]
	    					);



		    	$scope.cumplimientoHallazgosDonut = Utils.setChartConfig(
 								'pie', 
 								200, 
 								{
						            pie: {
						                allowPointSelect: true,
						                cursor: 'pointer',
						                dataLabels: {
						                    enabled: false
						                },
						                showInLegend: true
						            }
						        }, 
	    						{}, 
	    						{}, 
	    						[
	    							{
								        name: 'Estado',
								        colorByPoint: true,
								        innerSize: '80%',
								        data: success.data.attributes.cumplimiento_hallazgos
							    	}
							    ]
	    					);

		    	$scope.dashboard.cumplimientoGlobal			= success.data.attributes.porcentaje_cumplimiento.global;
		    	$scope.dashboard.cumplimientoInterno		= success.data.attributes.porcentaje_cumplimiento.interno;
 				$scope.dashboard.CumplimientoContratistas 	= success.data.attributes.porcentaje_cumplimiento.contratistas;

 				var indiceHallazgos = {
 					categories: [],
 					indices_por_obra: [], 	//NARANJO
 					indices_totales: [] 	//VERDE
 				};

 				angular.forEach(success.data.attributes.indice_de_hallazgos, function(value)
 				{
 					indiceHallazgos.categories.push(value.mes);
 					indiceHallazgos.indices_totales.push(value.indices_totales[0].index);
 					indiceHallazgos.indices_por_obra.push(_.reduce(value.indices_por_obra, function(memo, num){ return memo + num.index; }, 0) / value.indices_por_obra.length);
 					
 				});
 				

 				$scope.indiceHallazgos = Utils.setChartConfig(
 								'column', 
 								null, 
 								{
 									spline : {
					                	dataLabels : {
					                    	enabled : true,
					                    	color: 'orange',
					                    	style: {"fontSize": "15px", "fontWeight": "bold", "textOutline": "1px" },
					                    	formatter : function() {
					                        	return this.y + '%';
					                    	}
					                	}
					            	},
					            	column : {
					                	dataLabels : {
					                    	enabled : true,
					                    	color: 'green',
					                    	style: {"fontSize": "15px", "fontWeight": "bold", "textOutline": "1px" },
					                    	formatter : function() {
					                        	return this.y + '%';
					                    	}
					                	}
					            	}
 								}, 
	    						{}, 
	    					 	{
	        						categories: indiceHallazgos.categories
	    						}, 
	    						[{
							        type: 'column',
							        name: 'Índice global de hallazgos - Pitagora',
							        data: indiceHallazgos.indices_totales
							    }, {
							        type: 'spline',
							        name: 'Índice de accidentes obras seleccionadas',
							        data: indiceHallazgos.indices_por_obra,
							        marker: {
							            lineWidth: 2,
							            lineColor: Highcharts.getOptions().colors[3],
							            fillColor: 'orange',
							            symbol: 'circle',
							            radius: 7
							        }
							    }]
	    					);

 				$scope.dashboard.causasDirectas = success.data.attributes.causas_directas; 
 				$scope.dashboard.causasBasicas  = success.data.attributes.causas_basicas; 

 				$scope.dashboard.causasDirectasTotal = _.reduce(success.data.attributes.causas_directas, function(memo, num){ return memo + num.num_reports; }, 0); 
 				$scope.dashboard.causasBasicasTotal  = _.reduce(success.data.attributes.causas_basicas, function(memo, num){ return memo + num.num_reports; }, 0); 
		    	
    		}
		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getDashboardInfo);
			}
		});
	};


 	/*$scope.causasDirectas = Utils.setChartConfig(
 								'pie', 
 								250, 
 								{
						            pie: {
						                allowPointSelect: true,
						                cursor: 'pointer',
						                dataLabels: {
						                    enabled: false
						                },
						                showInLegend: true
						            }
						        }, 
	    						{}, 
	    						{}, 
	    						[
	    							{
								        name: 'Riesgo',
								        colorByPoint: true,
								        innerSize: '80%',
								        data: [{
								            name: 'Bajo',
								            y: 20
								        }, {
								            name: 'Medio',
								            y: 20,
								        }, {
								            name: 'Alto',
								            y: 60
								        }]
							    	}
							    ]
	    					);



 	$scope.causasBasicas = Utils.setChartConfig(
 								'pie', 
 								250, 
 								{
						            pie: {
						                allowPointSelect: true,
						                cursor: 'pointer',
						                dataLabels: {
						                    enabled: false
						                },
						                showInLegend: true
						            }
						        }, 
	    						{}, 
	    						{}, 
	    						[
	    							{
								        name: 'Riesgo',
								        colorByPoint: true,
								        innerSize: '80%',
								        data: [{
								            name: 'Bajo',
								            y: 20
								        }, {
								            name: 'Medio',
								            y: 20,
								        }, {
								            name: 'Alto',
								            y: 60
								        }]
							    	}
							    ]
	    					);*/

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
 				$scope.getConstructions($scope.page.filters.companies.selected);
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

 	$scope.getConstructions = function(companySelected) {

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

 				for (var i = 0; i < success.data.length; i++) {
 					$scope.page.filters.constructions.list.push({
 						id: parseInt(success.data[i].id),
 						name: $filter('capitalize')(success.data[i].attributes.name, true),
 						type: 'dealers'
 					});
 				}

 				$scope.page.filters.constructions.selected = $scope.page.filters.constructions.list[0];
 				$scope.page.filters.constructions.disabled = false;
 				$scope.page.filters.constructions.loaded = true;

 				if (companySelected.id != '') 
 				{
 					$scope.getDashboardInfo();
 				}

 			} else {
 				$scope.page.filters.constructions.disabled = true;
 				$log.error(success);
 			}
 		}, function(error) {
 			$scope.page.filters.constructions.disabled = true;
 			$log.error(error);
 			if (error.status === 401) {
 				Utils.refreshToken($scope.getConstructions);
 			}
 		});
 	};
 	
 	getCompanies();

 	$scope.openDatePicker = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.page.filters.date.opened = !$scope.page.filters.date.opened;
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};


 	$scope.$watch('page.filters.constructions.loaded', function() {
		if ($scope.page.filters.constructions.loaded) {
			$scope.$watch('page.filters.date.value', function() {
				$scope.getDashboardInfo();
			});
		}
	});
});