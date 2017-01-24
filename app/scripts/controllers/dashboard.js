'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:GenricDashboardCtrl
 * @description
 * # GenricDashboardCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')
	.controller('GenericDashboardCtrl', function($scope, $log, Utils, NgTableParams, Dashboard) {

		$scope.page = {
			title: 'Dashboard'
		};

		$scope.dashboard = {
			data: {
				reportCounts: {
					numCurrentMonth: 0,
					numLastMonth: 0
				}
			}
		};

		$scope.show = {
			actual: false,
			anterior: false
		};

		var i = 0;

		$scope.mesAnterior = [];

		$scope.chartConfigReportsByMonth = Utils.setChartConfig('column', 400, {}, {}, {}, []);

		var setChartConfigReportsByMonth = function(categories, series) {
			$scope.chartConfigReportsByMonth = Utils.setChartConfig('column', 400, {}, {
					min: 0,
					title: {
						text: null
					}
				},
				categories,
				series
			);
		};

		var setTableParamsCurrentMonthReportsByUser = function(data) {
			$scope.tableParamsCurrentMonthReportsByUser = new NgTableParams({
				page: 1,
				count: data.length,
				sorting: {
					'userName': 'asc'
				}
			}, {
				counts: [],
				total: data.length,
				dataset: data
			});
		};

		var setTableParamsLastMonthReportsByUser = function(data) {
			$scope.tableParamsLastMonthReportsByUser = new NgTableParams({
				page: 1,
				count: data.length,
				sorting: {
					'userName': 'desc'
				}
			}, {
				counts: [],
				total: data.length,
				dataset: data
			});
		};

		$scope.getDashboard = function() {
			var reportsByMonth = {
				data: {
					categories: [],
					title: {
						text: 'Meses'
					}
				},
				series: [{
					name: 'Reportes asignados',
					data: []
				}, {
					name: 'Reportes ejecutados',
					data: []
				}]
			};

			var currentMonthReportsByUser = [],
				LastMonthReportsByUser = [];

			Dashboard.query({}, function(success) {
				//$log.error(success);
				if (success.data) {
					$scope.dashboard.data.reportCounts.numCurrentMonth = success.data.attributes.report_counts.num_current_month;
					$scope.dashboard.data.reportCounts.numLastMonth = success.data.attributes.report_counts.num_last_month;

					for (i = 0; i < success.data.attributes.reports_by_month.length; i++) {
						reportsByMonth.data.categories.push(success.data.attributes.reports_by_month[i].month_name);
						reportsByMonth.series[0].data.push(success.data.attributes.reports_by_month[i].num_assigned);
						reportsByMonth.series[1].data.push(success.data.attributes.reports_by_month[i].num_executed);
					}

					setChartConfigReportsByMonth(reportsByMonth.data, reportsByMonth.series);

					for (i = 0; i < success.data.attributes.current_month_reports_by_user.length; i++) {
						currentMonthReportsByUser.push({
							userName: success.data.attributes.current_month_reports_by_user[i].user_name,
							numAssignedReports: success.data.attributes.current_month_reports_by_user[i].num_assigned_reports,
							numExecutedReports: success.data.attributes.current_month_reports_by_user[i].num_executed_reports
						});
					}
					if (currentMonthReportsByUser.length > 0) 
					{
						$scope.show.actual = true;
					}
					setTableParamsCurrentMonthReportsByUser(currentMonthReportsByUser);

					for (i = 0; i < success.data.attributes.last_month_reports_by_user.length; i++) {
						LastMonthReportsByUser.push({
							userName: success.data.attributes.last_month_reports_by_user[i].user_name,
							numAssignedReports: success.data.attributes.last_month_reports_by_user[i].num_assigned_reports,
							numExecutedReports: success.data.attributes.last_month_reports_by_user[i].num_executed_reports
						});
					}
					if (LastMonthReportsByUser.length > 0) 
					{
						$scope.show.anterior = true;
					}
					$log.error($scope.show.anterior);
					setTableParamsLastMonthReportsByUser(LastMonthReportsByUser);
					$scope.mesAnterior = LastMonthReportsByUser;

				} else {
					$log.error(success);
				}
			}, function(error) {
				$log.error(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.getDashboard);
				}
			});
		};

		$scope.getDashboard();

	});