'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:AccidentalnessDashboardCtrl
 * @description
 * # AccidentalnessDashboardCtrl
 * Controller of the efindingAdminApp
 */
 angular.module('efindingAdminApp')
 .controller('AccidentalnessDashboardCtrl', function($scope, $filter, $log, $moment, Utils, NgTableParams, Dashboard, Companies, Constructions, Users, NgMap) {
 	
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

 	$scope.accidentabilidadGlobal = Utils.setChartConfig(
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
							            symbol: 'circle',
							            radius: 7
							        },
							        line: {
							        	radius: 2
							        },
							        data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 23.3, 18.3, 13.9, 9.6]
							    }]
	    					);



 	$scope.siniestralidadGlobal = Utils.setChartConfig(
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
							            symbol: 'circle',
							            radius: 7
							        },
							        line: {
							        	radius: 2
							        },
							        data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 23.3, 18.3, 13.9, 9.6]
							    }]
	    					);



 	$scope.tasaAccidentabilidad = Utils.setChartConfig(
 								'spline', 
 								null, 
 								{
 									spline : {
 										color: 'green',
					                	dataLabels : {
					                    	enabled : true,
					                    	color: 'black',
					                    	style: {"fontSize": "15px", "fontWeight": "bold", "textOutline": "1px" },
					                    	formatter : function() {
					                        	return this.y + '%';
					                    	}
					                	}
					            	},
					            	line: {
					            		color: 'orange'
					            	}
 								}, 
	    						{}, 
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
							    	type: 'spline',
							        name: 'Todas las obras',
							        marker: {
							            symbol: 'circle',
							            radius: 7
							        },
							        line: {
							        	radius: 2
							        },
							        data: [0, 1, 2, 2, 2, 4, 5, 7, 7, 7, 10, 10]
							    },
							    {
							        type: 'line',
							        data: [[0, 1], [11, 5]],
							        name: 'Meta',
							        marker: {
							            enabled: false
							        },
							        states: {
							            hover: {
							                lineWidth: 1
							            }
							        },
							        enableMouseTracking: false
							    }
							    ]
	    					);
 	

 	$scope.tasaSiniestralidad = Utils.setChartConfig(
 								'spline', 
 								null, 
 								{
 									spline : {
 										color: 'green',
					                	dataLabels : {
					                    	enabled : true,
					                    	color: 'black',
					                    	style: {"fontSize": "15px", "fontWeight": "bold", "textOutline": "1px" },
					                    	formatter : function() {
					                        	return this.y + '%';
					                    	}
					                	}
					            	},
					            	line: {
					            		color: 'orange'
					            	}
 								}, 
	    						{}, 
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
							    	type: 'spline',
							        name: 'Todas las obras',
							        marker: {
							            symbol: 'circle',
							            radius: 7
							        },
							        line: {
							        	radius: 2
							        },
							        data: [0, 1, 2, 2, 2, 4, 5, 7, 7, 7, 10, 10]
							    },
							    {
							        type: 'line',
							        data: [[0, 1], [11, 5]],
							        name: 'Meta',
							        marker: {
							            enabled: false
							        },
							        states: {
							            hover: {
							                lineWidth: 1
							            }
							        },
							        enableMouseTracking: false
							    }
							    ]
	    					);
});