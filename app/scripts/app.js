'use strict';

/**
 * @ngdoc overview
 * @name efindingAdminApp
 * @description
 * # efindingAdminApp
 *
 * Main module of the application.
 */
angular
	.module('efindingAdminApp', [
		'ngAnimate',
		'ngCookies',
		'ngResource',
		'ngSanitize',
		'ngTouch',
		'picardy.fontawesome',
		'ui.bootstrap',
		'ui.router',
		'ui.utils',
		'angular-loading-bar',
		'angular-momentjs',
		'angularBootstrapNavTree',
		'ui.select',
		'datatables',
		'ngTable',
		'LocalStorageModule',
		'angular-underscore',
		'satellizer',
		'highcharts-ng',
		'angularjs-dropdown-multiselect',
		'daterangepicker',
		'ngMap'
	])

.run(['$rootScope', '$state', '$stateParams', 'Utils', '$log',
	function($rootScope, $state, $stateParams, Utils, $log) {
		$rootScope.$state = $state;
		$rootScope.$stateParams = $stateParams;

		$rootScope.$on('$stateChangeSuccess', function(event, toState) {

			event.targetScope.$watch('$viewContentLoaded', function() {

				angular.element('html, body, #content').animate({
					scrollTop: 0
				}, 200);

				setTimeout(function() {
					angular.element('#wrap').css('visibility', 'visible');

					if (!angular.element('.dropdown').hasClass('open')) {
						angular.element('.dropdown').find('>ul').slideUp();
					}
				}, 200);
			});
			$rootScope.containerClass = toState.containerClass;
		});

		$rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {

			var isLogin = toState.name === 'login' || toState.name === 'signup' || toState.name === 'forgotpass';

			if (isLogin) {
				return;
			}

			if (!Utils.getInStorage('logged')) {
				e.preventDefault(); // stop current execution
				$state.go('login'); // go to login
			}

		});
	}

])

.config(['uiSelectConfig',
	function(uiSelectConfig) {
		uiSelectConfig.theme = 'bootstrap';
	}
])

.config(['localStorageServiceProvider',
	function(localStorageServiceProvider) {
		localStorageServiceProvider
			.setStorageType('localStorage');
	}
])

.config(['$authProvider',
	function($authProvider) {
		// Parametros de configuración
		$authProvider.loginUrl = 'http://50.16.161.152/efinding-staging/oauth/token'; //Desarrollo
		//$authProvider.loginUrl = 'http://localhost:3000/oauth/token'; 					//Local
		$authProvider.tokenName = 'access_token';
	}
])

.config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/login');

		$stateProvider

			.state('login', {
			url: '/login',
			controller: 'LoginCtrl',
			templateUrl: 'views/tmpl/pages/login.html'
		})

		.state('signup', {
			url: '/signup?confirmation_token&id',
			controller: 'SignupCtrl',
			templateUrl: 'views/tmpl/pages/signup.html'
		})

		.state('forgotpass', {
			url: '/forgotpass',
			controller: 'ForgotPasswordCtrl',
			templateUrl: 'views/tmpl/pages/forgotpass.html'
		})

		.state('page404', {
			url: '/page404',
			templateUrl: 'views/tmpl/pages/page404.html'
		})

		.state('efinding', {
			abstract: true,
			url: '/efinding',
			templateUrl: 'views/tmpl/app.html'
		})

		//dashboard
		.state('efinding.dashboard', {
				url: '/dashboard',
				template: '<div ui-view></div>'
			})
			.state('efinding.dashboard.generic', {
				url: '/generic',
				templateUrl: 'views/tmpl/dashboard/generic.html',
				controller: 'GenericDashboardCtrl'
			})

		//Users
		.state('efinding.users', {
				url: '/usuarios',
				template: '<div ui-view></div>'
			})
			.state('efinding.users.list', {
				url: '/lista',
				templateUrl: 'views/tmpl/users/list.html',
				controller: 'UsersListCtrl'
			})
			.state('efinding.users.invite', {
				url: '/invitar',
				templateUrl: 'views/tmpl/users/invite.html',
				controller: 'UsersInviteCtrl'
			})

		//Reports
		.state('efinding.inspecciones', {
				url: '/inspecciones',
				template: '<div ui-view></div>'
			})
			.state('efinding.inspecciones.list', {
				url: '/lista',
				templateUrl: 'views/tmpl/reports/list.html',
				controller: 'ReportsListCtrl'
			})

		//Masters
		.state('efinding.maestros', {
				url: '/maestros',
				template: '<div ui-view></div>'
			})
			.state('efinding.maestros.tabla', {
				url: '/generic?type',
				templateUrl: 'views/tmpl/masters/generic.html',
				controller: 'MastersGenericCtrl'
			});

	}
]);