'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:UsersListCtrl
 * @description
 * # UsersListCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')

.controller('UsersListCtrl', function($scope, $log, $filter, $window, $uibModal, NgTableParams, Users, Invitations, Utils) {

	$scope.page = {
		title: 'Lista de usuarios'
	};

	var data = [];

	$scope.getUsers = function() {

		data = [];

		Users.query({
			idUser: ''
		}, function(success) {

			$log.error(success);

			if (success.data) {
				data = [];
				for (var i = 0; i < success.data.length; i++) {
					data.push({
						id: success.data[i].id,
						firstName: success.data[i].attributes.first_name,
						lastName: success.data[i].attributes.last_name,
						email: success.data[i].attributes.email,
						roleName: success.data[i].attributes.role_name,
						roleId: success.data[i].attributes.role_id,
						active: success.data[i].attributes.active
					});
				}

				$scope.tableParams = new NgTableParams({
					page: 1, // show first page
					count: 50, // count per page
					sorting: {
						active: 'desc' // initial sorting
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
			if (error.status === 401) {
				Utils.refreshToken($scope.getUsers);
			}
		});

	};

	$scope.getUsers();

	$scope.openModalUserDetails = function(idUser) {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'userDetails.html',
			controller: 'UserDetailsInstance',
			resolve: {
				idUser: function() {
					return idUser;
				}
			}
		});

		modalInstance.result.then(function(datos) {
			if (datos.action === 'removeUser') {
				for (var i = 0; i < data.length; i++) {
					if (data[i].id === datos.idUser) {
						data.splice(i, 1);
					}
				}
			}
			if (datos.action === 'editUser') {
				for (var j = 0; j < data.length; j++) {
					if (data[j].id === datos.success.data.id) {
						data[j].firstName = datos.success.data.attributes.first_name;
						data[j].lastName = datos.success.data.attributes.last_name;
						data[j].email = datos.success.data.attributes.email;
					}
				}
			}
			$scope.tableParams.reload();
		}, function() {});
	};

	var openSendInvitation = function(userEmail) {

		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'sendInvitation.html',
			controller: 'SendInvitationInstance',
			resolve: {
				userEmail: function() {
					return userEmail;
				}
			}
		});

		modalInstance.result.then(function() {}, function() {
			$scope.getUsers();
		});
	};

	$scope.resendInvitation = function(email, roleId) {

		Invitations.save({
			"data": {
				"type": "invitations",
				"attributes": {
					"role_id": roleId,
					"email": email
				}
			}
		}, function(success) {
			// $log.log(success);

			if (success.data) {
				openSendInvitation(email);
			}

		}, function(error) {
			$log.log(error);

		});
	};

})

.controller('UserDetailsInstance', function($scope, $log, $uibModalInstance, idUser, Users, Validators, Utils) {

	$scope.user = {
		id: null,
		email: {
			text: '',
			disabled: true
		},
		image: '',
		firstName: {
			text: '',
			disabled: true
		},
		lastName: {
			text: '',
			disabled: true
		},
		rut: {
			text: '',
			disabled: true
		},
		role: {
			id: null,
			text: '',
			disabled: true
		},
		phoneNumber: {
			text: '',
			disabled: true
		}
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

	$scope.ok = function() {
		// $uibModalInstance.close($scope.selected.item);
		$uibModalInstance.close();
	};

	$scope.cancel = function() {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.getUserDetails = function(idUser) {

		Users.query({
			idUser: idUser
		}, function(success) {
			if (success.data) {

				$scope.elements.title = success.data.attributes.first_name + ' ' + success.data.attributes.last_name;

				$scope.user.id = success.data.id;
				$scope.user.firstName.text = success.data.attributes.first_name;
				$scope.user.lastName.text = success.data.attributes.last_name;
				$scope.user.email.text = success.data.attributes.email;
				$scope.user.role.id = success.data.attributes.role_id;
				$scope.user.role.text = success.data.attributes.role_name;
				$scope.user.phoneNumber.text = success.data.attributes.phone_number;
				$scope.user.rut.text = success.data.attributes.rut;

				if (success.data.attributes.image) {
					$scope.user.image = success.data.attributes.image;
				} else {
					$scope.user.image = 'http://dhg7r6mxe01qf.cloudfront.net/icons/admin/placeholder-user-photo.png';
				}

			} else {
				$log.log(success);
			}
		}, function(error) {
			$log.log(error);
		});

	};

	$scope.getUserDetails(idUser);

	$scope.editUser = function(idUser) {

		if ($scope.elements.buttons.editUser.text === 'Editar') {
			$scope.elements.buttons.editUser.text = 'Guardar';
			$scope.elements.buttons.editUser.border = '';
			enableFormInputs();
		} else {

			// $log.log($scope.user.firstName.text);
			// $log.log($scope.user.lastName.text);
			// $log.log($scope.user.rut.text);
			// $log.log($scope.user.phoneNumber.text);
			// $log.log($scope.user.role.id);

			if (!Validators.validateRequiredField($scope.user.firstName.text) || !Validators.validateRequiredField($scope.user.lastName.text)) {
				$scope.elements.alert.title = 'Faltan datos por rellenar';
				$scope.elements.alert.text = '';
				$scope.elements.alert.color = 'danger';
				$scope.elements.alert.show = true;
				return;
			}

			$scope.elements.buttons.editUser.text = 'Editar';
			$scope.elements.buttons.editUser.border = 'btn-border';
			disableFormInputs();

			Users.update({
				data: {
					type: 'users',
					id: idUser,
					attributes: {
						first_name: $scope.user.firstName.text,
						last_name: $scope.user.lastName.text,
						image: '',
						role_id: 2
					}
				},
				idUser: idUser
			}, function(success) {
				if (success.data) {
					$scope.elements.alert.title = 'Se han actualizado los datos del usuario';
					$scope.elements.alert.text = '';
					$scope.elements.alert.color = 'success';
					$scope.elements.alert.show = true;

					disableFormInputs();

					$scope.getUserDetails(idUser);

					$uibModalInstance.close({
						action: 'editUser',
						success: success
					});

				} else {
					$log.log(success);
				}
			}, function(error) {
				$log.log(error);
			});

		}

	};

	$scope.removeUser = function(idUser) {

		if ($scope.elements.buttons.removeUser.text === 'Eliminar') {
			$scope.elements.buttons.removeUser.text = 'Si, eliminar';

			$scope.elements.buttons.removeUser.border = '';
			$scope.elements.alert.show = true;
			$scope.elements.alert.title = '¿Seguro que desea eliminar al usuario?';
			$scope.elements.alert.text = 'Para eliminarlo, vuelva a presionar el botón';
			$scope.elements.alert.color = 'danger';

		} else {
			$scope.elements.buttons.removeUser.text = 'Eliminar';

			Users.delete({
				idUser: idUser
			}, function(success) {

				$uibModalInstance.close({
					action: 'removeUser',
					idUser: idUser
				});

			}, function(error) {
				$log.log(error);
				if (error.status === 401) {
					Utils.refreshToken($scope.removeUser);
				}
			});
		}

	};

	$scope.formatRut = function(rut) {

		if (Validators.validateRutCheckDigit(rut)) {
			$scope.user.rut.text = Utils.formatRut(rut);
		}

	};

	var enableFormInputs = function() {
		$scope.user.firstName.disabled = false;
		$scope.user.lastName.disabled = false;
		$scope.user.rut.disabled = false;
		$scope.user.phoneNumber.disabled = false;
		$scope.user.role.disabled = false;
	};

	var disableFormInputs = function() {
		$scope.user.firstName.disabled = true;
		$scope.user.lastName.disabled = true;
		$scope.user.rut.disabled = true;
		$scope.user.phoneNumber.disabled = true;
		$scope.user.role.disabled = true;
	};

	$scope.hideAlert = function() {
		$scope.elements.alert.show = false;
		$scope.elements.alert.title = '';
		$scope.elements.alert.text = '';
		$scope.elements.alert.color = '';
	};

})

.controller('SendInvitationInstance', function($scope, $log, $uibModalInstance, userEmail) {

	$scope.user = {
		email: userEmail
	};

	$scope.ok = function() {
		$uibModalInstance.close();
	};


});