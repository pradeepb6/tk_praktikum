app.controller('chairUserMasterController', ['$scope', 'adminService', 'submissionService', function ($scope, adminService, submissionService) {
    submissionService.getSubmissions().then(function (response) {
        $scope.submissions = response.data;
    })
}]);