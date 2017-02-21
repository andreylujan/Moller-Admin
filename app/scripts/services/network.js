'use strict';

var API_URL = 'http://50.16.161.152/efinding-staging/api/v1';		//Desarrollo
var URL_SERVER = 'http://50.16.161.152/efinding-staging/';		//Desarrollo
//var API_URL = 'http://localhost:3000/api/v1';						//Local
//var URL_SERVER = 'http://localhost:3000/';							//Local

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

// ROLES
.factory('Roles', function($resource) {

	return $resource(API_URL + '/organizations/:idOrganization/roles', {
		idOrganization: '@idOrganization'
	}, {
		query: {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/vnd.api+json'
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

.factory('ReportsByMonth', function($auth) {
	return {
		getFile: function(elem, fileName, month, year) {
			var downloadLink = angular.element(elem);
			downloadLink.attr('href', API_URL + '/reports/xlsx?access_token=' + $auth.getToken() + '&month=' + month + '&year=' + year);
			downloadLink.attr('download', fileName + '.xlsx');
		}
	};
})

// CHANGE PASSWORD
.factory('ChangePassword', function($resource) {
	return $resource(API_URL + '/users/:idUser/password', {
		idUser: '@idUser'
	}, {
		save: {
			method: 'PUT',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json'
			},
			params: {
				password: '@password',
				password_confirmation: '@password_confirmation',
				reset_password_token: '@reset_password_token'
			}
		}
	});
})


// Comapnies
.factory('Companies', function($resource) {

	return $resource(API_URL + '/companies/:idCompany', {
		idCompany: '@idCompany'
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

/// Constructions
.factory('Constructions', function($resource) {

	return $resource(API_URL + '/constructions/:constructionId', {
		constructionId: '@constructionId'
	}, {
		query: {
			method: 'GET',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: '@include',
				'filter[company_id]': '@constructionId',
				'fields[constructions': 'name,company_id'
			}
		},
		save: {
			method: 'POST',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			}
		},
		update: {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			}
		},
		delete: {
			method: 'DELETE',
			headers: {
				Accept: 'application/vnd.api+json'
			}
		}
	});

})

/// DASHBOARD
.factory('Dashboard', function($resource) {

	return $resource(API_URL + '/dashboard', {
	}, {
		query: {
			method: 'GET',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: '@include',
				'filter[construction][name]': '@constructionName',
				'filter[construction][company][name]': '@companyName',
				'filter[state_name]': '@statusName',
				'filter[creator][name]': '@supervisorName',
				'filter[start_date]': '@startDate',
				'filter[end_date]': '@endDate'
			}
		}
	});

})

/// COLLECTIONS
.factory('Collection', function($resource) {

	return $resource(API_URL + '/collections/:idCollection', {
		idCollection: '@idCollection'
	}, {
		query: {
			method: 'GET',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: 'collection_items',
				'fields[collection_items]': 'parent_item_id,collection_id,name'
			}
		},
		detail: {
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: 'parent_item',
			}
		}
	});

})


//COLLECTION ITEM
.factory('Collection_Item', function($resource) {

	return $resource(API_URL + '/collection_items/:idCollection', {
		idCollection: '@idCollection'
	}, {
		query: {
			method: 'GET',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: 'parent_item'
			}
		},
		update: {
			method: 'PUT',
			headers: {
				Accept: 'application/vnd.api+json',
				'Content-Type': 'application/vnd.api+json',
				'include': 'collection_items'
			}
		},
		delete: {
			method: 'DELETE',
			headers: {
				Accept: 'application/vnd.api+json'
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

// Checklists
.factory('Checklists', function($resource) {

	return $resource(API_URL + '/checklist_reports', {
	}, {
		query: {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/vnd.api+json'
			},
			params: {
				include: 'construction.company,creator,users',
				'fields[users]': 'full_name',
				'fields[constructions]': 'name,company',
				'fields[companies]': 'name'

			}
		},
		save: {
			method: 'POST',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			}
		},
		update: {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			}
		}
	});

})

// ChecklistActions
.factory('ChecklistActions', function($resource) {

	return $resource(API_URL + '/checklists/:idChecklist', {
		idChecklist: '@idChecklist'
	}, {
		save: {
			method: 'POST',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			}
		},
		update: {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			}
		},
		delete: {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/vnd.api+json',
				Accept: 'application/vnd.api+json'
			}
		},
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

.factory('ExcelMaster', function($auth) {
	return {
		getFile: function(elem, dashboard, fileName) {
			var downloadLink = angular.element(elem);
			downloadLink.attr('href', API_URL + '/dashboard/' + dashboard + '.xlsx?access_token=' + $auth.getToken());
			downloadLink.attr('download', fileName + '.xlsx');
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