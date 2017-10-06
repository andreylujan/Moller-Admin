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

			var isLogin = toState.name === 'login' || toState.name === 'signup' 
			|| toState.name === 'forgotpass' || toState.name === 'publicDashboard'
			|| toState.name === 'publicInspectionsDashboard' || toState.name === 'publicChecklistDashboard'
			|| toState.name === 'publicAccidentalnessDashboard';

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
		$authProvider.loginUrl = 'http://34.229.215.234/efinding/oauth/token'; 	//Produccion
		//$authProvider.loginUrl = 'http://50.16.161.152/pitagora/oauth/token'; 	//Pitagora
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

		//DASHBOARDS PUBLICOS
		.state('publicDashboard', {
			url: '/public?token&refresh',
			templateUrl: 'views/tmpl/pages/dashboard-manflas-public.html',
			controller: 'InspectionsPublicDashboardCtrl',
		})
		.state('publicInspectionsDashboard', {
			url: '/inspectionsDashboard?token&refresh',
			templateUrl: 'views/tmpl/dashboard-public/inspections.html',
			controller: 'InspectionsPublicDashboardCtrl',
		})
		.state('publicChecklistDashboard', {
			url: '/checklistDashboard?token&refresh',
			templateUrl: 'views/tmpl/dashboard-public/checklist.html',
			controller: 'ChecklistPublicDashboardCtrl',
		})
		.state('publicAccidentalnessDashboard', {
			url: '/accidentalnessDashboard?token&refresh',
			templateUrl: 'views/tmpl/dashboard-public/accidentalness.html',
			controller: 'AccidentalnessPublicDashboardCtrl',
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
			.state('efinding.dashboard.manflas', {
				url: '/manflas',
				templateUrl: 'views/tmpl/dashboard/dashboard-manflas.html',
				controller: 'ManflasDashboardCtrl'
			})
			.state('efinding.dashboard.inspections', {
				url: '/inspections',
				templateUrl: 'views/tmpl/dashboard/dashboard-inspections.html',
				controller: 'InspectionsDashboardCtrl'
			})
			.state('efinding.dashboard.checklist', {
				url: '/checklist',
				templateUrl: 'views/tmpl/dashboard/dashboard-checklist.html',
				controller: 'ChecklistDashboardCtrl'
			})
			.state('efinding.dashboard.accidentalness', {
				url: '/accidentalness',
				templateUrl: 'views/tmpl/dashboard/dashboard-accidentalness.html',
				controller: 'AccidentalnessDashboardCtrl'
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

		//Hallazgos MANFLAS
		.state('efinding.hallazgos', {
				url: '/hallazgos',
				template: '<div ui-view></div>'
			})
			.state('efinding.hallazgos.lista', {
				url: '/lista',
				templateUrl: 'views/tmpl/reports/manflas.html',
				controller: 'HallazgosManflas'
			})
			.state('efinding.hallazgos.tareas', {
				url: '/listaTareas',
				templateUrl: 'views/tmpl/reports/manflas.html',
				controller: 'TareasManflas'
			})
			.state('efinding.hallazgos.propios', {
				url: '/propios',
				templateUrl: 'views/tmpl/reports/manflas.html',
				controller: 'MisHallazgosManflas'
			})

		//Checklist
		.state('efinding.checklist', {
				url: '/checklist',
				template: '<div ui-view></div>'
			})
			.state('efinding.checklist.list', {
				url: '/lista',
				templateUrl: 'views/tmpl/masters/checklist.html',
				controller: 'ChecklistCtrl'
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
			})

		//Obras
		.state('efinding.obras', {
				url: '/obras',
				template: '<div ui-view></div>'
			})
			.state('efinding.obras.tabla', {
				url: '/construction',
				templateUrl: 'views/tmpl/masters/construction.html',
				controller: 'MastersConstructionCtrl'
			})
			.state('efinding.obras.personal', {
				url: '/personnel',
				templateUrl: 'views/tmpl/masters/personnel.html',
				controller: 'MastersPersonnelCtrl'
			})
			.state('efinding.obras.checklist', {
				url: '/checklist',
				templateUrl: 'views/tmpl/masters/master-checklist.html',
				controller: 'MasterChecklistCtrl'
			})
			.state('efinding.obras.new-checklist', {
				url: '/new-checklist?idChecklist',
				controller: 'NewChecklistCtrl',
				templateUrl: 'views/tmpl/masters/new-checklist.html'
			})
			.state('efinding.obras.cargas', {
				url: '/history-massive-loads',
				templateUrl: 'views/tmpl/masters/history-massive-loads.html',
				controller: 'HistoryMassiveLoadsCtrl'
			})
			.state('efinding.obras.companies', {
				url: '/empresas',
				templateUrl: 'views/tmpl/masters/companies.html',
				controller: 'MastersCompaniesCtrl'
			})
			.state('efinding.obras.pitagora', {
				url: '/pitagora',
				templateUrl: 'views/tmpl/masters/construction-pitagora.html',
				controller: 'MastersConstructionPitagoraCtrl'
			})
			.state('efinding.obras.contractors', {
				url: '/contratistas',
				templateUrl: 'views/tmpl/masters/contractors.html',
				controller: 'MastersContractorsCtrl'
			})
			.state('efinding.obras.accidentalness', {
				url: '/accidentabilidad',
				templateUrl: 'views/tmpl/masters/accidentalness.html',
				controller: 'MastersAccidentalnessCtrl'
			})

    
		//Areas
		.state('efinding.areas', {
				url: '/areas',
				template: '<div ui-view></div>'
			})
			.state('efinding.areas.lista', {
				url: '/lista?type=23',
				templateUrl: 'views/tmpl/masters/areas-manflas.html',
				controller: 'MasterAreasManflasCtrl'
			})

		//Roles
		.state('efinding.roles', {
				url: '/roles',
				template: '<div ui-view></div>'
			})
			.state('efinding.roles.lista', {
				url: '/lista',
				templateUrl: 'views/tmpl/masters/roles-list.html',
				controller: 'MasterRolesList'
			})
			.state('efinding.roles.editar-rol', {
				url: '/editar?idRol',
				templateUrl: 'views/tmpl/masters/roles-edit.html',
				controller: 'MasterRolesEdit'
			})
    
		.state('efinding.change-password', {
			url: '/change-password',
			templateUrl: 'views/tmpl/pages/change-password.html',
			controller: 'ChangePasswordCtrl'
		});
	}
]);