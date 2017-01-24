'use strict';

angular.module('efindingAdminApp')

.controller('CategoryCtrl', function($scope, $log, $filter, $window, $moment, $uibModal, SnowImages, ngTableParams) {

	$scope.success = false;
	var show = false;
	var i = 0;
	var data = [];

	$scope.dateRange = {
		options: {
			minDate: $moment("2016-05-24"),
			locale: {
				applyLabel: 'Buscar',
				cancelLabel: 'Cancelar',
				customRangeLabel: 'Personalizado',
				fromLabel: 'Desde',
				toLabel: 'Hasta'
			}
		},
		startDate: $moment().hour(-4).minute(0).second(0).format('MMMM D, YYYY'),
		endDate: $moment().add(1, 'day').hour(-4).minute(0).second(0).format('MMMM D, YYYY')
	};

	var getImagesByCategories = function(dateStart, dateEnd) {
		// $log.log('con: ' + $moment(dateStart).hour(-4).minute(0).second(0).toISOString());
		// $log.log('con: ' + $moment(dateEnd).hour(-4).minute(0).second(0).toISOString());

		$scope.success = false;

		data = [];

		SnowImages.query({
			action: 'getImagesSnow',
			date_start: $moment(dateStart).hour(-4).minute(0).second(0).toISOString(),
			date_end: $moment(dateEnd).hour(-4).minute(0).second(0).toISOString()
		}, function(success) {
			// $log.log(success);

			if (success.status === "1") {

				for (i = 0; i < success.data.length; i++) {

					if (success.data[i].snow_muestra === "1") {
						show = true;
					} else if (success.data[i].snow_muestra === "0") {
						show = false;
					}

					data.push({
						id: success.data[i].id_image,
						url: success.data[i].url,
						comment: success.data[i].snow_comment,
						tags: success.data[i].tags,
						createDate: success.data[i].create_date,
						userRut: success.data[i].snow_usuario,
						show: show
					});
				}

				$scope.tableParams = new ngTableParams({
					page: 1, // show first page
					count: 25, // count per page
					filter: {
						//name: 'M'       // initial filter
					},
					sorting: {
						//name: 'asc'     // initial sorting
					}
				}, {
					total: data.length, // length of data
					getData: function($defer, params) {
						// use build-in angular filter
						var filteredData = params.filter() ?
							$filter('filter')(data, params.filter()) :
							data;
						var orderedData = params.sorting() ?
							$filter('orderBy')(filteredData, params.orderBy()) :
							data;

						params.total(orderedData.length); // set total for recalc pagination
						$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
					}
				});

				$scope.success = true;
			}
		}, function(error) {
			$log.error(error);
		});

	};

	$scope.updateShowImage = function(imageId, showState, index) {

		// $log.log('id: ' + imageId);
		// $log.log('showState: ');
		// $log.log(showState);

		SnowImages.update({
			action: 'editImageSnow',
			image_id: imageId,
			show: showState
		}, function(success) {
			if (success.status !== "1") {
				$log.error(success);
				$scope.openModalMessage(success.status, showState);
				data[index].show = !showState;
			}
		}, function(error) {
			$log.error(error);
			$scope.openModalMessage(error.status, showState);
			data[index].show = !showState;
		});

	};

	$scope.openModalMessage = function(state, showState) {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'modalMessage.html',
			controller: 'ModalMessageModalInstance',
			resolve: {
				state: function() {
					return state;
				},
				showState: function() {
					return showState;
				}
			}
		});

		modalInstance.result.then(function() {}, function() {});
	};

	// Evento que se dispara al presionar boton buscar del date range picker
	angular.element('#content').on('apply.daterangepicker', function(ev, picker) {
		getImagesByCategories($scope.dateRange.startDate, $scope.dateRange.endDate);
	});

	getImagesByCategories($scope.dateRange.startDate, $scope.dateRange.endDate);

})

.controller('ModalMessageModalInstance', function($scope, $log, $uibModalInstance, state, showState) {

	var action = null;

	if (showState) {
		action = 'activar';
	} else {
		action = 'desactivar';
	}

	$scope.modals = {
		modalMessage: {
			title: {
				text: null
			},
			subtitle: {
				text: null
			},
			text_1: null
		}
	};

	$scope.modals.modalMessage.text_1 = 'Ha ocurrido un error al ' + action + ' la imagen';

	$scope.ok = function() {
		$uibModalInstance.close();
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

});