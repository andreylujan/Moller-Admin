'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:ManflasPublicDashboardCtrl
 * @description
 * # ManflasPublicDashboardCtrl
 * Controller of the efindingAdminApp
 */
 angular.module('efindingAdminApp')
 .controller('AccidentalnessPublicDashboardCtrl', function($scope, $auth, $filter, $state, $log, 
 	$timeout, $moment, Utils, DashboardAccidentalness) {
 	
 	//traer el token
 	var token = $state.params.token;
 	var refresh_token = $state.params.refresh;
 	
 	Utils.setInStorage('refresh_t', refresh_token);
 	$auth.setToken(token);

	$scope.page = {
 		title: 'Accidentabilidad'
 	};

 	
 	$scope.getDashboardInfo = function() {
 		DashboardAccidentalness.query({
 		}, function(success) {
		    if (success.data) {

		    	$scope.accidentabilidadGlobal = {};
		    	$scope.siniestralidadGlobal = {};
		    	$scope.tasaAccidentabilidad = {};
		    	$scope.tasaSiniestralidad = {};
		    	
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
							        },
							        title: {
						            	text: 'Porcentaje'
						        	}
						    	}, 
	    						{
							        categories: _.map(success.data.attributes.tasas_accidentabilidad, function(num, key){ return num.mes; })
							    }, 
	    						[{
							        name: 'Tasa de accidentibilidad',
							        marker: {
							            symbol: 'circle',
							            radius: 7
							        },
							        line: {
							        	radius: 2
							        },
							        color: 'green',
							        data: _.map(success.data.attributes.tasas_accidentabilidad, function(num, key){ return parseFloat(num.tasa_accidentabilidad.toFixed(2)); })
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
							        },
							        title: {
						            	text: 'Porcentaje'
						        	}
						    	}, 
	    						{
							        categories: _.map(success.data.attributes.tasas_accidentabilidad, function(num, key){ return num.mes; })
							    }, 
	    						[{
							        name: 'Tasa de siniestralidad',
							        marker: {
							            symbol: 'circle',
							            radius: 7
							        },
							        line: {
							        	radius: 2
							        },
							        color: 'green',
							        data: _.map(success.data.attributes.tasas_accidentabilidad, function(num, key){ return parseFloat(num.tasa_siniestralidad.toFixed(2)); })
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
	    						{
							        title: {
						            	text: 'Porcentaje'
						        	}
	    						}, 
	    						{
	    							categories: _.map(success.data.attributes.tasas_accidentabilidad, function(num, key){ return num.mes; })
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
							        data: _.map(success.data.attributes.tasas_accidentabilidad, function(num, key){ return parseFloat(num.tasa_accidentabilidad_acumulada.toFixed(2)); })
							    },
							    {
							        type: 'line',
							        data: success.data.attributes.meta_accidentabilidad,
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
	    						{
							        title: {
						            	text: 'Porcentaje'
						        	}
	    						}, 
	    						{
	    							categories: _.map(success.data.attributes.tasas_accidentabilidad, function(num, key){ return num.mes; })
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
							        data: _.map(success.data.attributes.tasas_accidentabilidad, function(num, key){ return parseFloat(num.tasa_siniestralidad_acumulada.toFixed(2)); })
							    },
							    {
							        type: 'line',
							        data: success.data.attributes.meta_siniestralidad,
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
    		}
		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getDashboardInfo);


			}
		});
	};

	$scope.getDashboardInfo();

});