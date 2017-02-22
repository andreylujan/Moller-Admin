'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:ChecklistCtrl
 * @description
 * # ChecklistCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('ChecklistCtrl', function($scope, $log, $window, $uibModal, $filter, $state, NgTableParams, Checklists, Utils) {

	$scope.page = {
		title: 'Lista de checklist'
	};

	var checklists = [];

	$scope.getChecklists = function(e) {
		if (!e.success) {
			$log.error(e.detail);
			return;
		}

		checklists = [];

		Checklists.query({
		}, function(success) {

			for (var i = 0; i < success.data.length; i++) {

				var aux = {};

				aux.id = success.data[i].id;
				aux.pdf = success.data[i].attributes.pdf;
				aux.pdfUploaded = success.data[i].attributes.pdf_uploaded;
				aux.code = success.data[i].attributes.code;
				aux.userNames = success.data[i].attributes.user_names;
				aux.indicator = success.data[i].attributes.total_indicator;
				aux.fechaCreacion = success.data[i].attributes.formatted_created_at;
				aux.company = '-';
				aux.construction = '-';
				
				for (var j = 0; j < success.included.length; j++) {
					if (success.data[i].relationships['construction'].data.type === success.included[j].type &&
						success.data[i].relationships['construction'].data.id === success.included[j].id) 
					{
						aux.construction = success.included[j].attributes.name;

						for (var k = 0; k < success.included.length; k++) {
							if (success.included[j].relationships.company.data.type === success.included[k].type &&
								success.included[j].relationships.company.data.id === success.included[k].id)
							{
								aux.company = success.included[k].attributes.name;
								break;
							}
						}
						break;
					}
				}
				checklists.push(aux);
			}

			$scope.tableParams = new NgTableParams({
				page: 1, // show first page
				count: 25, // count per page
				sorting: {
					name: 'desc' // initial sorting
				}
			}, {
				total: checklists.length, // length of checklists
				dataset: checklists
			});

		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.getChecklists);
			}
		});

	};

	$scope.downloadPdf = function(event) {
		var pdf = angular.element(event.target).data('pdf');
		if (pdf) {
			$window.open(pdf, '_blank');
		}
	};

	$scope.getChecklists({
		success: true,
		detail: 'OK'
	});

});