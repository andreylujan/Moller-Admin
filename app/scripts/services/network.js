'use strict';

var API_URL = 'http://50.16.161.152/efinding-staging/api/v1';//Desarrollo
var URL_SERVER = 'http://50.16.161.152/efinding-staging/';	//Desarrollo

angular.module('efindingAdminApp')

// LOGIN
.factory('Login', function($resource) {

	return $resource(API_URL + '/index.php/:action', {
		action: '@action'
	}, {
		refresh: {
			method: 'POST',
			'Content-Type': 'application/json'
		}
	});

})

// REFRESH
.factory('RefreshToken', function($resource) {

	return $resource(URL_SERVER + '/oauth/token', {}, {
		save: {
			method: 'POST',
			'Content-Type': 'application/json'
		}
	});

})

// DASHBOARD
.factory('Dashboard', function($resource) {

	return $resource(API_URL + '/dashboard', {}, {
		query: {
			method: 'GET',
			'Content-Type': 'application/json'
		}
	});

})

// REPORTES
.factory('Reports', function($resource) {

	return $resource(API_URL + '/reports', {
	}, {
		query: {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: 'creator,report_type,assigned_user',
				fieldsUsers: '@fieldsUsers',
				fieldsReports: '@fieldsReports',
				fieldsEquipments: '@fieldsEquipments',
				all: 'true'
			}
		},
		save: {
			method: 'POST',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			}
		}
	});

})

// INSPECCIONES
.factory('Inspections', function($resource) {

	return $resource(API_URL + '/inspections/:idInspection', {
		idInspection: '@idInspection'
	}, {
		query: {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: '@include',
				fieldsUsers: '@fieldsUsers',
				fieldsReports: '@fieldsReports',
				fieldsEquipments: '@fieldsEquipments'
			}
		},
		save: {
			method: 'POST',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			}
		},
		detail: {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: 'construction.company,creator',
			}
		}
	});

})

// Invitaciones
.factory('Invitations', function($resource) {

	return $resource(API_URL + '/invitations', {}, {
		save: {
			method: 'POST',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			}
		}

	});

})

// InviteLink
.factory('InviteLink', function($resource, $state) {

	return $resource(API_URL + '/invitations/:id', {
		id: '@id'
	}, {
		update: {
			method: 'PUT',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			},
			params: {
				confirmation_token: '@confirmation_token'
			}
		}

	});

})

//Firmar
.factory('Firmar', function($resource) {

	return $resource(API_URL + '/inspections/:idInspection/transition?transition_name=sign', {
		idInspection: '@idInspection'
	}, {
		save: {
			method: 'POST',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			}
		}
	});
})

// TableColumns
.factory('TableColumns', function($resource) {

	return $resource(API_URL + '/table_columns?filter[collection_name]=:type', {
		type: '@type'
	}, {
		query: {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json'
			}
		}
	});

})

// USERS
.factory('Users', function($resource) {

	return $resource(API_URL + '/users/:idUser', {
		idUser: '@idUser'
	}, {
		query: {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json'
			},
			params: '@fields'
		},
		save: {
			method: 'POST',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			}
		},
		update: {
			method: 'PUT',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			},
		},
		delete: {
			method: 'DELETE',
			headers: {
				Accept: 'application/vnd.api+json'
			}
		},
		sendEmailWithToken: {
			method: 'POST',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			}
		},
		verifyPassToken: {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json'
			},
			params: {
				email: '@email',
				reset_password_token: '@reset_password_token'
			}
		}


	});

})


// ACTIVIDADES
.factory('Activities', function($resource) {

	return $resource(API_URL + '/activity_types/:idActivity', {
		idActivity: '@idActivity'
	}, {
		query: {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json'
			},
			params: '@include'
		},
		save: {
			method: 'POST',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			}
		},
		delete: {
			method: 'DELETE',
			headers: {
				Accept: 'application/vnd.api+json'
			}
		},
		update: {
			method: 'PUT',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			},
		}
	});

})

// MassiveLoads
.factory('MassiveLoads', function($resource) {

	return $resource(API_URL + '/batch_uploads', {}, {
		query: {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: '@include'
			}
		}
	});

})

// menu_sections
.factory('MenuSections', function($resource) {

	return $resource(API_URL + '/menu_sections', {}, {
		query: {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: '@include'
			}
		}
	});

})

.factory('GetPdfsZip', function($auth) {

	return {
		getFile: function(elem, reportIds) {
			var downloadLink = angular.element(elem);
			downloadLink.attr('href', API_URL + '/reports/zip?filter[ids]=' + reportIds + '&access_token=' + $auth.getToken());
			downloadLink.attr('download', 'reportes.zip');
		}
	};

})


// CSV
.service('Csv', function($resource, $http, $log) {

	// this.uploadFileToUrl = function(form) {

	var fd = new FormData();

	return {
		upload: function(form) {

			for (var i = 0; i < form.length; i++) {
				fd.append(form[i].field, form[i].value);
			}

			return $http.post(API_URL + '/csv', fd, {
				transformRequest: angular.identity,
				headers: {
					'Content-Type': undefined
				}
			});
		}
	};

});