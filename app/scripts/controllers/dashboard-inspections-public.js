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
 	$timeout, $moment, Utils, $q) {
 	
 	var token = $state.params.token;
 	var refresh_token = $state.params.refresh;
 	
 	Utils.setInStorage('refresh_t', refresh_token);
 	$auth.setToken(token);

 	var currentDate = new Date();
 	var firstMonthDay = new Date();
 	firstMonthDay.setDate(1);


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
			}
		},
		markers: {
			resolved: [],
			unchecked: []
		}
 	};


 	///COMIENZAN LOS CHARTS

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
						            	text: 'Rainfall (mm)'
						        	}
						    	}, 
	    						{
							        categories: [
							            'Jan',
							            'Feb',
							            'Mar',
							            'Apr',
							            'May',
							            'Jun',
							            'Jul',
							            'Aug',
							            'Sep',
							            'Oct',
							            'Nov',
							            'Dec'
							        ],
							        crosshair: true
							    }, 
	    						[   
	    							{
							        	name: 'Bajo',
							        	data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
							    	}, {
							        	name: 'Medio',
							        	data: [83.6, 78.8, 98.5, 93.4, 106.0, 84.5, 105.0, 104.3, 91.2, 83.5, 106.6, 92.3]
							    	}, {     
						    			name: 'Alto',
						        		data: [48.9, 38.8, 39.3, 41.4, 47.0, 48.3, 59.0, 59.6, 52.4, 65.2, 59.3, 51.2]
						    		}
    							]
	    					);

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
	        						categories: ['ABR', 'MAY', 'JUN']
	    						}, 
	    						[{
							        type: 'column',
							        name: 'Índice global de hallazgos - Pitagora',
							        data: [1.50, 1, 1.20]
							    }, {
							        type: 'spline',
							        name: 'Índice de acctidentes obras seleccionadas',
							        data: [2.33, 1.27, 1.94],
							        marker: {
							            lineWidth: 2,
							            lineColor: Highcharts.getOptions().colors[3],
							            fillColor: 'orange',
							            symbol: 'circle',
							            radius: 7
							        }
							    }]
	    					);


 	$scope.causasDirectas = Utils.setChartConfig(
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
	    					);
});