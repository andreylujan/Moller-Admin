'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:ChecklistDashboardCtrl
 * @description
 * # ChecklistDashboardCtrl
 * Controller of the efindingAdminApp
 */
 angular.module('efindingAdminApp')
 .controller('ChecklistDashboardCtrl', function($scope, $filter, $log, $moment, Utils, 
 												DashboardChecklist, Companies, Constructions, ChecklistActions) {
 	
 	$scope.page = {
 		title: 'Lista de Chequeo',
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
 			},
 			companies: {
 				list: [],
 				selected: null
 			},
 			constructions: {
 				list: [],
 				selected: null,
 				disabled: false
 			},
 			checklist: {
 				list: [],
 				selected: null,
 				disabled: false,
 				loaded: false
 			}
 		}
 	};

 	$scope.dashboard = {
 		promedioCumplimiento: 0,
 		cumplimientoObras: []
 	};

 	$scope.getDashboardInfo = function() {
 		DashboardChecklist.query({
 		}, function(success) {
		    if (success.data) 
		    {
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
							        categories: _.map(success.data.attributes.cumplimiento_por_periodo, function(num, key){ return num.date; })
							    }, 
	    						[{
							        name: 'Mes',
							        marker: {
							            symbol: 'circle'
							        },
							        data: _.map(success.data.attributes.cumplimiento_por_periodo, function(num, key){ return parseFloat(num.cumplimiento.replace('%','')); })
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
						                    format: success.data.attributes.cumplimiento_minimo.replace('%','') + ' % de cumplimiento'
						                },
						            }
	    						}, 
	    						{
						        	min: 0
						    	}, 
	    						{
	    							 categories: _.map(success.data.attributes.obras_bajo_meta, function(num, key){ return num.obra; })
	    						}, 
	    						[
								    {
								        name: 'Obras',
								        type: 'column',
								        data: _.map(success.data.attributes.obras_bajo_meta, function(num, key){ return parseFloat(num.cumplimiento.replace('%','')); })
								    },
								    {
								        type: 'line',
								        name: success.data.attributes.cumplimiento_minimo.replace('%','') + ' % de cumplimiento',
								        data: [
								        		{ 
								        			y: parseFloat(success.data.attributes.cumplimiento_minimo.replace('%','')), 
      												dataLabels: {
                    									enabled: true
                									}
            									},
            									[success.data.attributes.obras_bajo_meta.length-1 , parseFloat(success.data.attributes.cumplimiento_minimo.replace('%',''))]],
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

 				//SACAR PROMEDIO
 			 	//_.reduce(success.data.attributes.cumplimiento_por_obra, function(memo, num){ return memo + parseFloat(num.cumplimiento.replace('&','')); }, 0) / success.data.attributes.cumplimiento_por_obra.length

 			 	$scope.dashboard.promedioCumplimiento = (_.reduce(success.data.attributes.cumplimiento_por_obra, function(memo, num){ return memo + parseFloat(num.cumplimiento.replace('&','')); }, 0) / success.data.attributes.cumplimiento_por_obra.length).toFixed(2);

 			 	angular.forEach(success.data.attributes.cumplimiento_por_obra, function(value, key)
 			 	{
 			 		$scope.dashboard.cumplimientoObras.push({obra: value.obra, cumplimiento: value.cumplimiento});
 			 		
 			 	});

 			 	//$log.error($scope.dashboard.cumplimientoObras);
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

 	$scope.getChecklist = function() {

 		$scope.page.filters.checklist.selected = [];
 		$scope.page.filters.checklist.list = [];
 		ChecklistActions.query({}, 
 			function(success) {
	 			if (success.data) {

	 				$scope.page.filters.checklist.list.push({
	 					id: '',
	 					name: 'Todas las listas'
	 				});

	 				for (var i = 0; i < success.data.length; i++) {
	 					$scope.page.filters.checklist.list.push({
	 						id: parseInt(success.data[i].id),
	 						name: $filter('capitalize')(success.data[i].attributes.name, true),
	 					});
	 				}

	 				$scope.page.filters.checklist.selected = $scope.page.filters.checklist.list[0];
	 				$scope.page.filters.checklist.disabled = false;
	 				$scope.page.filters.checklist.loaded = true;

	 			} 
	 			else 
	 			{
	 				$log.error(success);
	 				$scope.page.filters.checklist.disabled = true;
	 			}
	 		}, function(error) {
	 			$log.error(error);
	 			$scope.page.filters.checklist.disabled = true
	 			if (error.status === 401) {
	 				Utils.refreshToken($scope.getChecklist);
	 			}
 			});
 	};
 	getCompanies();
 	$scope.getChecklist();



 	$scope.$watch('page.filters.checklist.loaded', function() {
		if ($scope.page.filters.checklist.loaded) {
			$scope.$watch('page.filters.date.value', function() {
				$scope.getDashboardInfo();
			});
		}
	});

});