'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:AccidentalnessDashboardCtrl
 * @description
 * # AccidentalnessDashboardCtrl
 * Controller of the efindingAdminApp
 */
 angular.module('efindingAdminApp')
 .controller('AccidentalnessDashboardCtrl', function($auth, $scope, $filter, $log, $moment, Utils, NgTableParams, 
 													DashboardAccidentalness, Companies, Constructions) {
 	$scope.page = {
 		title: 'Accidentabilidad',
 		filters: {
 			date: {
 				value: new Date(),
 				opened: false
 			},
 			companies: {
 				list: [],
 				selected: null
 			},
 			constructions: {
 				list: [],
 				selected: null,
 				disabled: false,
 				loaded: false
 			}
 		}
 	};

 	
 	$scope.getDashboardInfo = function() {

 		var companyIdSelected = $scope.page.filters.companies.selected ? $scope.page.filters.companies.selected.id : '';
 		var constructionIdSelected = $scope.page.filters.constructions.selected ? $scope.page.filters.constructions.selected.id : '';

 		var date = (new Date($scope.page.filters.date.value).getMonth()+1) + '/' + new Date($scope.page.filters.date.value).getFullYear();


 		DashboardAccidentalness.query({
 			'filter[company_id]': companyIdSelected,
 			'filter[construction_id]': constructionIdSelected,
 			'filter[period]': date
 		}, function(success) {
		    if (success.data) {

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
							                return this.value;
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
							                return this.value;
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




 	$scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.page.filters.date.opened = true;
    };

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