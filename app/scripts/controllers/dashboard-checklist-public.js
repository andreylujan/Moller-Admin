'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:ChecklistPublicDashboardCtrl
 * @description
 * # ChecklistPublicDashboardCtrl
 * Controller of the efindingAdminApp
 */
 angular.module('efindingAdminApp')
 .controller('ChecklistPublicDashboardCtrl', function($scope, $auth, $filter, $state, $log, 
 													$timeout, $moment, Utils, ChecklistActions, DashboardChecklist) {
 	
 	//traer el token
 	var token = $state.params.token;
 	var refresh_token = $state.params.refresh;
 	
 	Utils.setInStorage('refresh_t', refresh_token);
 	$auth.setToken(token);

	$scope.page = {
 		title: 'Lista de Chequeo',
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

 	$scope.reset = function()
 	{
 		$scope.dashboard.cumplimientoObras = [];
 		$scope.getDashboardInfo();
 	}

 	$scope.getDashboardInfo = function() {

		$scope.dashboard.cumplimientoObras		= [];
 		var checklistIdSelected 	= $scope.page.filters.checklist.selected ? $scope.page.filters.checklist.selected.id : '';
 		DashboardChecklist.query({
 			'filter[checklist_id]': checklistIdSelected
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
							        },
							        title: {
						            	text: 'Porcentaje'
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
							        color: 'green',
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
						        	min: 0,
							        title: {
						            	text: 'Porcentaje'
						        	}
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

 				var promedio = (_.reduce(success.data.attributes.cumplimiento_por_obra, function(memo, num){ return memo + parseFloat(num.cumplimiento.replace('&','')); }, 0) / success.data.attributes.cumplimiento_por_obra.length).toFixed(2);
 				if (promedio == 'NaN') 
 				{
 					promedio = 0;
 				}
 			 	$scope.dashboard.promedioCumplimiento = promedio;

 			 	angular.forEach(success.data.attributes.cumplimiento_por_obra, function(value, key)
 			 	{
 			 		$scope.dashboard.cumplimientoObras.push({obra: value.obra, cumplimiento: value.cumplimiento});
 			 		
 			 	});
    		}
		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getDashboardInfo);
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
 	$scope.getChecklist();




 	$scope.$watch('page.filters.checklist.loaded', function() {
		if ($scope.page.filters.checklist.loaded) {
			$scope.getDashboardInfo();
		}
	});
});