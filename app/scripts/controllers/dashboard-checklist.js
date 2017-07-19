'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:ChecklistDashboardCtrl
 * @description
 * # ChecklistDashboardCtrl
 * Controller of the efindingAdminApp
 */
 angular.module('efindingAdminApp')
 .controller('ChecklistDashboardCtrl', function($scope, $filter, $log, $moment, Utils, NgTableParams, Dashboard, Companies, Constructions, Users, NgMap) {
 	
 	var currentDate = new Date();
 	var firstMonthDay = new Date();
 	firstMonthDay.setDate(1);


 	$scope.page = {
 		title: 'Lista de Chequeo',
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


 	///INICIO CHARTS
 	$scope.listaChequeo = Utils.setChartConfig(
 								'spline', 
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
					                	},
					                	showInLegend: false
					            	}
	    						}, 
	    						{
						        	labels: {
							            formatter: function () {
							                return this.value + '°';
							            }
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
							        ]
							    }, 
	    						[{
							        name: 'Tokyo',
							        marker: {
							            symbol: 'circle'
							        },
							        data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 23.3, 18.3, 13.9, 9.6]
							    }]
	    					);


 	$scope.bajoCumplimiento = Utils.setChartConfig(
 								'column', 
 								null, 
 								{
	        						column: {
						                allowPointSelect: true,
						                cursor: 'pointer',
						                color: 'orange',
						                dataLabels: {
						                	color: 'orange',
						                    enabled: true,
						                    style: {"fontSize": "15px", "fontWeight": "bold", "textOutline": "1px" },
						                    format: '{point.y:.1f}%'
						                },
						                showInLegend: true
						            },
						            line: {
						                allowPointSelect: true,
						                cursor: 'pointer',
						                color: 'red',
						                showInLegend: true,
						                dataLabels: {
						                	color: 'red',
						                    style: {"fontSize": "15px", "fontWeight": "bold", "textOutline": "1px" },
						                    format: '50% de cumplimiento'
						                },
						            }
	    						}, 
	    						{
						        	min: 0
						    	}, 
	    						{
	    							 categories: [
							            'Obra1',
							            'Obra2',
							            'Obra3',
							            'Obra4',
							            'Obra5',
							            'Obra6',
							            'Obra7',
							            'Obra8',
							            'Obra9',
							            'Obra10',
							            'Obra11',
							            'Obra12'
							        ]
	    						}, 
	    						[
		    						{
								        type: 'line',
								        name: '50% de cumplimiento',
								        data: [
								        		{ 
								        			y: 50, 
      												dataLabels: {
                    									enabled: true
                									}
            									},
            									[11,50]],
								        marker: {
								            enabled: false
								        },
								        states: {
								            hover: {
								                lineWidth: 1
								            }
								        },
								        enableMouseTracking: false
								    },
								    {
								        name: 'Obras',
								        type: 'column',
								        data: [42, 22, 31, 43, 43, 28, 34, 18, 35, 27, 29, 30]
								    }
							    ]
	    					);

});