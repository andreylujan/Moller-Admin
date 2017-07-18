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
 	
 	$scope.page = {
 		title: 'Lista de Chequeo'
 	};

 	//GRAFICO1
 	Highcharts.chart('grafico1', {
	    chart: {
	        type: 'spline'
	    },
	    title: {
	        text: null
	    },
	    subtitle: {
	        text: null
	    },
	    xAxis: {
	        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	    },
	    yAxis: {
	        labels: {
	            formatter: function () {
	                return this.value + '°';
	            }
	        }
	    },
	    tooltip: {
	        crosshairs: true,
	        shared: true
	    },
	    plotOptions: {
	        spline: {
	            marker: {
	                radius: 4,
	                lineColor: '#666666',
	                lineWidth: 1
	            },
	            showInLegend: false
	        }
	    },
	    series: [{
	        name: 'Tokyo',
	        marker: {
	            symbol: 'square'
	        },
	        data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 23.3, 18.3, 13.9, 9.6]
	    }]
	});


 	//GRAFICO 2
	Highcharts.chart('grafico2', {
	    xAxis: {
	        min: 0,
	        max: 5
	    },
	    yAxis: {
	        min: 0
	    },
	    title: {
	        text: null
	    },
	    plotOptions: {
            column: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}%'
                },
                showInLegend: true
            }
        },
	    series: [{
	        type: 'line',
	        name: 'x% de cumplimiento',
	        data: [[0, 50], [5, 50]],
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
	        type: 'column',
	        name: 'Jane',
	        data: [3, 2, 1, 3, 4, 5]
	    }]
	});
});