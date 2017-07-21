'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:InspectionsDashboardCtrl
 * @description
 * # InspectionsDashboardCtrl
 * Controller of the efindingAdminApp
 */
 angular.module('efindingAdminApp')
 .controller('InspectionsDashboardCtrl', function($scope, $filter, $log, $moment, Utils, NgTableParams, Dashboard, Companies, Constructions, Users, NgMap) {
 	
 	var currentDate = new Date();
 	var firstMonthDay = new Date();
 	firstMonthDay.setDate(1);


 	$scope.page = {
 		title: 'Inspecciones',
 		filters: {
 			date: {
 				dateOptions: 
 				{
 					formatYear: 'yy',
				    startingDay: 1,
				    'class': 'datepicker'
 				},
 				format: 'dd-MM-yyyy',
 				value: new Date(),
 				opened: false
 			}
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