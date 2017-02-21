'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:ChecklistCtrl
 * @description
 * # ChecklistCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('ChecklistCtrl', function($scope, $log, $uibModal, $filter, $state, NgTableParams, Checklists, Utils) {

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

	/*$scope.openModalDeleteChecklist = function(idChecklist) {

		// var idChecklist = idChecklist;

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'messageListChecklist.html',
			controller: 'MessageListChecklistModalInstance',
			resolve: {
				idChecklist: function() {
					return idChecklist;
				}
			}
		});

		modalInstance.result.then(function() {
			$scope.getChecklists({
				success: true,
				detail: 'OK'
			});
		}, function() {});
	};

	$scope.gotoNewChecklist = function(idChecklist) {
		$state.go('app.masters.new-checklist', {
			idChecklist: idChecklist
		});
	};*/

	$scope.getChecklists({
		success: true,
		detail: 'OK'
	});

});

/*.controller('MessageListChecklistModalInstance', function($scope, $log, $uibModalInstance, idChecklist, ChecklistActions, Validators, Utils) {

	$scope.modal = {
		title: {
			text: null
		},
		subtitle: {
			text: null
		},
		alert: {
			color: '',
			show: false,
			title: '',
			text: null
		},
		buttons: {
			delete: {
				border: false,
				show: true,
				text: 'Eliminar'
			}
		}
	};

	$scope.deleteChecklist = function(e) {
		if (!e.success) {
			$log.error(e.detail);
			return;
		}

		ChecklistActions.delete({
			idChecklist: idChecklist
		}, function(success) {
			$log.log(success);
			$uibModalInstance.close();
		}, function(error) {
			$log.error(error);
			if (error.status === 401) {
				Utils.refreshToken($scope.deleteChecklist);
			}
		});

	};

	$scope.ok = function() {
		// $uibModalInstance.close($scope.selected.item);
		$uibModalInstance.close();
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.removeAlert = function() {
		$scope.modal.alert.color = '';
		$scope.modal.alert.title = '';
		$scope.modal.alert.text = '';
		$scope.modal.alert.show = false;
	};

});*/