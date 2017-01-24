'use strict';

/**
 * @ngdoc function
 * @name efindingAdminApp.controller:PagesForgotPasswordCtrl
 * @description
 * # PagesForgotPasswordCtrl
 * Controller of the efindingAdminApp
 */
angular.module('efindingAdminApp')
	.controller('ForgotPasswordCtrl', function($scope, $log, Users) {
		console.log('forgot');
		$scope.user = {
			email: {
				text:'',
				disabled: false
			}
		};

		$scope.page = {
			msg: {
				color: '',
				text: '',
				show: false
			},
			sendBtn: {
				disabled: false
			}
		};

		$scope.sendPassToken = function() {

			$scope.page.sendBtn.disabled = true;
			$scope.user.email.disabled = true;

			Users.sendEmailWithToken({
				idUser: 'reset_password_token',
				email: $scope.user.email.text
			}, function(success) {
				// $log.log(success);

				// Si el servicio se ejecuta (200) pero lanza un error de validacion
				if (success.errors) {
					$scope.page.msg.color = 'danger';
					$scope.page.msg.text = success.errors[0].detail;
					$scope.page.msg.show = true;
				} else {
					$scope.page.msg.color = 'greensea';
					$scope.page.msg.text = 'Te hemos enviado un correo con instrucciones, si el correo no aparece por favor revisa tu carpeta de spam.';
					$scope.page.msg.show = true;
				}

			}, function(error) {
				$log.log(error);
				$scope.page.msg.color = 'danger';
				$scope.page.msg.text = error.errors[0].detail;
				$scope.page.msg.show = true;
			});

		};

		$scope.removeMsg = function() {
			$scope.page.msg.color = '';
			$scope.page.msg.text = '';
			$scope.page.msg.show = false;
		};

	});