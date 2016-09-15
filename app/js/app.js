var app = angular.module('TKApp', ['ui.router', 'ui.bootstrap', 'ngStorage','ngTagsInput', 'ngFileUpload',
    'ngAnimate', 'nvd3', 'angularMoment', 'mm.acl']);

app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');
        $stateProvider
            .state('dashboard', {
                url: '/dashboard',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('dashboard')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                },
                templateUrl: 'views/dashboard.html',
                controller: 'dashboardController',
                activeTab: 'dashboard',
                publicAccess:true
            })
            .state('submission', {
                url: '/submission',
                templateUrl: 'views/submission.html',
                controller: 'submissionController',
                activeTab: 'submission',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('can_submit')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('submission-with-id', {
                url: '/submission/:id',
                templateUrl: 'views/submission.html',
                controller: 'submissionController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('can_edit_paper')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('authorDashboard', {
                url: '/authorDashboard',
                templateUrl: 'views/authorDashboard.html',
                controller: 'dashboardController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('isAuthor')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('reviewsForAuthor', {
                url: '/reviewsForAuthor',
                templateUrl: 'views/reviewsForAuthor.html',
                controller: 'dashboardController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('isAuthor')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('review', {
                url: '/review',
                templateUrl: 'views/review.html',
                controller: 'reviewController',
                activeTab: 'review',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('can_review')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('reviewDashboard', {
                url: '/reviewDashboard',
                templateUrl: 'views/reviewerDashboard.html',
                controller: 'reviewController',
                activeTab: 'reviewDashboard',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('can_review')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('review-with-id', {
                url: '/review/:id',
                templateUrl: 'views/review.html',
                controller: 'reviewController',
                activeTab: 'review',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('can_review')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('profile', {
                url: '/profile',
                templateUrl: 'views/profile.html',
                controller: 'profileController',
                activeTab: 'profile',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('profile')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                },
                publicAccess: true
            })
            .state('login', {
                url: '/login',
                templateUrl: 'views/login.html',
                controller: 'loginController',
                publicAccess: true
            })
            .state('chairDashboard', {
                url: '/chair/dashboard',
                templateUrl: 'views/chair/dashboard.html',
                controller: 'chairDashboardController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('chair_all')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('chairReviewAssign', {
                url: '/chair/review/assign',
                templateUrl: 'views/chair/reviewAssign.html',
                controller: 'chairReviewAssignController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('chair_all')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('chairAuthors', {
                url: '/chair/authors',
                templateUrl: 'views/chair/authors.html',
                controller: 'chairAuthorsController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('chair_all')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('chairReviewers', {
                url: '/chair/reviewers',
                templateUrl: 'views/chair/reviewers.html',
                controller: 'chairReviewersController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('chair_all')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('chairReviewMaster', {
                url: '/chair/review/master',
                templateUrl: 'views/chair/reviewMaster.html',
                controller: 'chairReviewMasterController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('chair_all')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('chairSubmissionMaster', {
                url: '/chair/submission/master',
                templateUrl: 'views/chair/submissionMaster.html',
                controller: 'chairSubmissionMasterController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('chair_all')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('chairSubmissionDetail', {
                url: '/chair/submission/detail/:id',
                templateUrl: 'views/chair/submissionDetail.html',
                controller: 'chairSubmissionDetailController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('chair_all')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('chairUserMaster', {
                url: '/chair/user/master',
                templateUrl: 'views/chair/userMaster.html',
                controller: 'chairUserMasterController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('chair_all')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('chairUserDetail', {
                url: '/chair/user/detail/:id',
                templateUrl: 'views/chair/userDetail.html',
                controller: 'chairUserDetailController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('chair_all')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            })
            .state('conference', {
                url: '/conference',
                templateUrl: 'views/conference.html',
                controller: 'conferenceController',
                resolve : {
                    'acl': ['$q', 'AclService', function ($q, AclService) {
                        if (AclService.can('chair_all')) {
                            // Has proper permissions
                            return true;
                        } else {
                            // Does not have permission
                            return $q.reject('Unauthorized');
                        }
                    }]
                }
            });

    }])
    .run(['$rootScope', '$location', '$localStorage', '$timeout', '$http', 'authService', 'AclService', '$state',
        function ($rootScope, $location, $localStorage, $timeout, $http, authService, AclService, $state) {
        var aclData = {
            guest: ['login'],
            chair: ['logout', 'profile', 'chair_all', 'isChair', 'can_view_paper'],
            author: ['logout', 'can_submit', 'dashboard', 'profile', 'isAuthor', 'can_edit_paper'],
            reviewer: ['logout', 'can_review', 'dashboard', 'profile', 'isReviewer', 'can_view_paper']
        };
        AclService.setAbilities(aclData);
        AclService.attachRole('guest');


        var path = function () {
            return $location.path();
        };
        $rootScope.userIsLoggedIn = authService.isLoggedIn();
        // keep user logged in after page refresh
        if ($localStorage.currentUser) {
            $http.defaults.headers.common.token = $localStorage.currentUser.token;
        }

        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, rejection) {
            $rootScope.userIsLoggedIn = authService.isLoggedIn();
            if ($localStorage.currentUser){
                // get user roles from backend to avoid hack
                $http.get('api/user/roles/get/'+$localStorage.currentUser.data._id)
                    .then(function (result) {
                        for(var i=0; i <result.data.length; i++)
                            AclService.attachRole(result.data[i].role);
                        if (rejection === 'Unauthorized') {
                            $state.go('dashboard');
                        }
                        else if (toState.url === "/login"){
                            if(AclService.can('isChair')){
                                $location.path('/chair/dashboard');
                            }
                            else{
                                $location.path('/dashboard');
                            }
                        }
                        else{
                            if(toParams.id)
                                $state.go(toState.name, {id: toParams.id});
                            else
                                $state.go(toState.name);
                        }

                    });
            }
            else{
                $rootScope.userIsLoggedIn = authService.isLoggedIn();
                $timeout(function () {
                    $location.path("/login");
                });
            }

        });

        $rootScope.user_logout = function () {
            authService.logout(function (response) {
                $rootScope.userIsLoggedIn = authService.isLoggedIn();
                $location.path("/login");
                AclService.detachRole('author');
                AclService.detachRole('reviewer');
                AclService.detachRole('chair');
            });
        }
    }]);
