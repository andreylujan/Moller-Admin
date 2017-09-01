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

		    	$log.error(success.data);

		    	$scope.accidentabilidadGlobal = {};
		    	$scope.siniestralidadGlobal = {};
		    	$scope.tasaAccidentabilidad = {};
		    	$scope.tasaSiniestralidad = {};
		    	$scope.tasa_accidentabilidad_acumulada = '';
		    	$scope.tasa_siniestralidad_acumulada = '';
		    	
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

 				$scope.tasa_accidentabilidad_acumulada 	= success.data.attributes.tasa_accidentabilidad_acumulada;
		    	$scope.tasa_siniestralidad_acumulada 	= success.data.attributes.tasa_siniestralidad_acumulada;

		    	var indice_frecuencia = [],
		    		indice_gravedad = [];

		    	angular.forEach(success.data.attributes.indices_de_frecuencia, function(value, key){
		    		indice_frecuencia.push([value.mes, value.indice_de_frecuencia]);
		    	});

		    	angular.forEach(success.data.attributes.indices_de_gravedad, function(value, key){
		    		indice_gravedad.push([value.mes, value.indice_de_gravedad]);
		    	});


 				$scope.indice_frecuencia = Utils.setChartConfig(
 								'column', 
 								355, 
 								{}, 
	    						{
						        	min: 0,
							        title: {
							            text: 'Valor'
							        }
						    	}, 
	    						{
							        type: 'category',
							        labels: {
							            rotation: -45,
							            style: {
							                fontSize: '13px',
							                fontFamily: 'Verdana, sans-serif'
							            }
							        },
							    }, 
							    [{
							    	showInLegend: false,
							        name: 'Total mes',
							        data: indice_frecuencia
							    }],
	    					);

 				$scope.indice_gravedad = Utils.setChartConfig(
 								'column', 
 								355, 
 								{}, 
	    						{
						        	min: 0,
							        title: {
							            text: 'Valor'
							        }
						    	}, 
	    						{
							        type: 'category',
							        labels: {
							            rotation: -45,
							            style: {
							                fontSize: '13px',
							                fontFamily: 'Verdana, sans-serif'
							            }
							        }
							    }, 
							    [{
							    	showInLegend: false,
							    	name: 'Total mes',
							        data: indice_gravedad
							    }],
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