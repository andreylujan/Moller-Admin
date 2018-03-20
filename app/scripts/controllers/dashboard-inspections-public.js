'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:InspectionsPublicDashboardCtrl
 * @description
 * # InspectionsPublicDashboardCtrl
 * Controller of the efindingAdminApp
 */
 angular.module('efindingAdminApp')
 .controller('InspectionsPublicDashboardCtrl', function($scope, $auth, $filter, $state, $log, 
 	$timeout, $moment, Utils, $q, DashboardInspections, Constructions) {
 	
 	var token = $state.params.token;
 	var refresh_token = $state.params.refresh;
 	
 	Utils.setInStorage('refresh_t', refresh_token);
 	$auth.setToken(token);

 	$scope.page = {
 		title: 'Inspecciones del último trimestre móvil',
 		filters: {
 			constructions2: {
 				list: [],
 				selected: [],
 				disabled: false,
 				loaded: false
 			},
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
 		causasBasicasTotal: 0,
 		indiceHallazgos: []
 	};

 	var date = (new Date().getMonth()+1) + '/' + new Date().getFullYear();
	$scope.getDashboardInfo = function() {
 		DashboardInspections.query({
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
 					indiceHallazgos.indices_por_obra.push(parseFloat((_.reduce(value.indices_por_obra, function(memo, num){ return memo + num.index; }, 0) / value.indices_por_obra.length).toFixed(2)));
 					
 				});

 				$scope.dashboard.indiceHallazgos = success.data.attributes.indice_de_hallazgos;
 				

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
	    						{
							        title: {
						            	text: 'Porcentaje'
						        	}
	    						}, 
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


	$scope.changeConstructions = function()
	{
		var listaCons = [];

		angular.forEach($scope.page.filters.constructions2.selected, function(value, key)
		{
			listaCons.push(value.name);
		});

		var indiceHallazgos = {
			categories: [],
			indices_por_obra: [], 	//NARANJO
			indices_totales: [] 	//VERDE
		};

		if (listaCons.length == 0) 
		{
			angular.forEach($scope.dashboard.indiceHallazgos, function(value)
			{
				indiceHallazgos.categories.push(value.mes);
				indiceHallazgos.indices_totales.push(value.indices_totales[0].index);
				indiceHallazgos.indices_por_obra.push(parseFloat((_.reduce(value.indices_por_obra, function(memo, num){ return memo + num.index; }, 0) / value.indices_por_obra.length).toFixed(2)));
				
			});
		}
		else
		{
			angular.forEach($scope.dashboard.indiceHallazgos, function(value)
			{
				angular.forEach(value.indices_por_obra, function(valor)
				{
					valor.active = false;
					if (_.find(listaCons, function(num){ return num == valor.name; }) != undefined) 
					{
						valor.active = true;
					}
				});

				indiceHallazgos.categories.push(value.mes);
				indiceHallazgos.indices_totales.push(value.indices_totales[0].index);
				indiceHallazgos.indices_por_obra.push(parseFloat((_.reduce(_.where(value.indices_por_obra, {active: true}), function(memo, num){ return memo + num.index; }, 0) / _.where(value.indices_por_obra, {active: true}).length).toFixed(2)));	
		});
		}


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
		        data: indiceHallazgos.indices_totales,
		        color: 'green'
		    }, {
		        type: 'spline',
		        name: 'Índice de accidentes obras seleccionadas',
		        data: indiceHallazgos.indices_por_obra,
		        color: 'orange',
		        marker: {
		            lineWidth: 2,
		            lineColor: Highcharts.getOptions().colors[3],
		            fillColor: 'orange',
		            symbol: 'circle',
		            radius: 7
		        }
		    }]
		);
	};

	$scope.getConstructions = function() {

 		$scope.page.filters.constructions2.selected = [];
 		$scope.page.filters.constructions2.list = [];

 		Constructions.query({
 		}, function(success) {
 			if (success.data) {

 				for (var i = 0; i < success.data.length; i++) {
 					$scope.page.filters.constructions2.list.push({
 						id: parseInt(success.data[i].id),
 						name: success.data[i].attributes.name,
 					});
 				}

 				$scope.page.filters.constructions2.selected = $scope.page.filters.constructions2.list[0];
 				$scope.page.filters.constructions2.disabled = false;
 				$scope.page.filters.constructions2.loaded = true;

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
 	
 	$scope.getConstructions();

	$scope.getDashboardInfo();
});