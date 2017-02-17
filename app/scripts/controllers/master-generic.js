'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:MastersGenericCtrl
 * @description
 * # MastersGenericCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('MastersGenericCtrl', function($scope, $log, $state, $uibModal, NgTableParams, $filter, Utils, Collection) {

	$scope.page = {
		title: ''
	};
	var data = [];

	var id_collection = $state.params.type;


	$scope.getCollection = function() {
		data = [];

		Collection.query({
			idCollection: id_collection
		}, function(success) {
			if (success.data) {
				$scope.page.title = success.data.attributes.name;
				data = [];
				for (var i = 0; i < success.included.length; i++) {
					data.push({
						// AQUI VAN LOS CAMPOS DEL JSON
						name: success.included[i].attributes.name,
						id: success.included[i].id,
						padre: success.included[i].attributes.parent_item_id
					});
				}

				$scope.tableParams = new NgTableParams({
					page: 1, // show first page
					count: 50, // count per page
					sorting: {
						name: 'desc' // initial sorting
					}
				}, {
					total: data.length, // length of data
					dataset: data
				});

			} else {
				$log.error(success);
			}
		}, function(error) {
			$log.error(error);
			if (error.status) {
				Utils.refreshToken($scope.getActivity);
			}
		});
	};

	$scope.openModalObjectDetails = function(idObject, idParent) {
		//$log.error(idObject);
		//$log.error(idParent);
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'genericDetails.html',
			controller: 'genericDetailsInstance',
			resolve: {
				idObject: function() {
					return idObject;
				},
				idParent: function() {
					return idParent;
				},
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'removeGeneric') {
				for (var i = 0; i < data.length; i++) {
					if (data[i].id === datos.idCollection) {
						data.splice(i, 1);
					}
				}
			}
			else if (datos.action === 'editGeneric') {				
				for (var j = 0; j < data.length; j++) {
					if (data[j].id === datos.success.data.id) {
						data[j].name = datos.success.data.attributes.name;
						break;
					}
				}
			}
			$scope.tableParams.reload();
		}, function() {});
	};

	/*$scope.openModalNewActivity = function() {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'newActivity.html',
			controller: 'NewActivityModalInstance',
			resolve: {}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'saveActivity') {
				data.push({
					name: datos.success.data.attributes.name,
					id: datos.success.data.id
				});
			}
			$scope.tableParams.reload();
		}, function() {});
	};*/


	$scope.getCollection();

})

.controller('genericDetailsInstance', function($scope, $log, $uibModalInstance, idObject, idParent, Validators, Utils, Collection, Collection_Item) {
	//$log.error(idObject);
	//$log.error(idParent);

	$scope.collection = {
		id: null,
		name: {
			text: '',
			disabled: true
		},
		parent_item_id: null
	};

	$scope.parentCollection = {
		visible: false,
		data: []
	};

	$scope.elements = {
		buttons: {
			editUser: {
				text: 'Editar',
				border: 'btn-border'
			},
			removeUser: {
				text: 'Eliminar',
				border: 'btn-border'
			}
		},
		title: '',
		alert: {
			show: false,
			title: '',
			text: '',
			color: '',
		}
	};

	$scope.selectedParent = null;

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};
	//$scope.activity.name.text = 'Mantención preventiva';

	$scope.getCollectionItem = function(idObject) {
		
		Collection_Item.query({
			idCollection: idObject
		}, function(success) {
			if (success.data) {
				$scope.collection.id 		= success.data.id;
				$scope.collection.name 		= success.data.attributes.name;
				$scope.collection.parent_item_id = success.data.attributes.parent_item_id;
				if ($scope.collection.parent_item_id != null) 
				{
					$scope.getCollection(success.included[0].attributes.collection_id);
				}


			} else {
				$log.log(success);
			}

		}, function(error) {
			$log.error(error);

		});
	};

	$scope.getCollection = function(idParent) {
		Collection.query({
			idCollection: idParent
		}, function(success) {
			if (success.data) {
				$scope.parentCollection.visible = true;

				for (var i = 0; i < success.included.length; i++) {
					$scope.parentCollection.data.push({
						name: success.included[i].attributes.name,
						id: success.included[i].id
					});
					if ($scope.collection.parent_item_id === success.included[i].id) 
					{
						$scope.collection.selectedParent = {name: success.included[i].attributes.name, id: success.included[i].id};
					}
				}

			} else {
				$log.log(success);
			}

		}, function(error) {
			$log.error(error);

		});
	};

	$scope.getCollectionItem(idObject);

	$scope.editGeneric = function(idObject) {

		if ($scope.elements.buttons.editUser.text === 'Editar') {
			$scope.elements.buttons.editUser.text = 'Guardar';
			$scope.elements.buttons.editUser.border = '';
		} else {
			if (!Validators.validateRequiredField($scope.collection.name)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = '';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			$scope.elements.buttons.editUser.text = 'Editar';
			$scope.elements.buttons.editUser.border = 'btn-border';
			var aux = {};
			if ($scope.collection.selectedParent === undefined) 
			{
				aux = { data: { type: 'collection_items', id: idObject, 
								attributes: { name: $scope.collection.name } }, idCollection: idObject };
			}
			else
			{
				aux = { data: { type: 'collection_items', id: idObject, 
								attributes: { name: $scope.collection.name } }, 
						relationships: { parent_item: { data: { type: "collection_items", 
										id: $scope.collection.selectedParent.id } } }, idCollection: idObject };
			}

			Collection_Item.update(aux, 
				function(success) {
					if (success.data) {
						$scope.elements.alert.title = 'Se han actualizado los datos de la actividad';
						$scope.elements.alert.text = '';
						$scope.elements.alert.color = 'success';
						$scope.elements.alert.show = true;
						$scope.getCollectionItem(idObject);

						$uibModalInstance.close({
							action: 'editGeneric',
							success: success
						});

					} else {
						$log.log(success);
					}
				}, function(error) {
					$log.log(error);
				}
			);
		}
	};

	$scope.removeGeneric = function(idObject) {

		if ($scope.elements.buttons.removeUser.text === 'Eliminar') {
			$scope.elements.buttons.removeUser.text = 'Si, eliminar';

			$scope.elements.buttons.removeUser.border = '';
			$scope.elements.alert.show = true;
			$scope.elements.alert.title = '¿Seguro que desea eliminar la actividad?';
			$scope.elements.alert.text = 'Para eliminarla, vuelva a presionar el botón';
			$scope.elements.alert.color = 'danger';

		} else {
			$scope.elements.buttons.removeUser.text = 'Eliminar';

			Collection_Item.delete({
				idCollection: idObject
			}, function(success) {

				$uibModalInstance.close({
					action: 'removeGeneric',
					idCollection: idObject
				});

			}, function(error) {
				$log.log(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.removeGeneric);
				}
			});
		}

	};


	$scope.hideAlert = function() {
		$scope.elements.alert.show = false;
		$scope.elements.alert.title = '';
		$scope.elements.alert.text = '';
		$scope.elements.alert.color = '';
	};

})

/*.controller('NewActivityModalInstance', function($scope, $log, $uibModalInstance, Activities, Csv, Utils) {

	$scope.modal = {
		csvFile: null
	};

	$scope.saveActivity = function() {

		if ($scope.modal.csvFile) {
			uploadCsvActivity();
		} else 
		{
			//$log.error($scope.modal.activity.type);
			Activities.save({
			data: {
				type: 'activity_types',
				attributes: {
					name: $scope.modal.activity.type
				}
			}
			}, function(success) {
				if (success.data) {

					$uibModalInstance.close({
						action: 'saveActivity',
						success: success
					});
				} 
				else 
				{
					$log.error(success);
					$scope.modal.alert.title = 'Error al Guardar';
					$scope.modal.alert.text = '';
					$scope.modal.alert.color = 'danger';
					$scope.modal.alert.show = true;
					return;
				}
			}, function(error) {
				$log.error(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.saveActivity);
				}
				$scope.modal.alert.title = 'Error al Guardar';
				$scope.modal.alert.text = '';
				$scope.modal.alert.color = 'danger';
				$scope.modal.alert.show = true;
				return;
			});
		}

	};

	var uploadCsvActivity = function() {

		$log.log($scope.modal.csvFile);

		var form = [{
			field: 'type',
			value: 'activities'
		}, {
			field: 'csv',
			value: $scope.page.csvFile
		}, {
			field: 'namespace',
			value: 'belltech'
		}];

		Csv.uploadFileToUrl(form);

	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});*/