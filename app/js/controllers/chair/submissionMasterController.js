app.controller('chairSubmissionMasterController', ['$scope', 'adminService', 'submissionService', '$localStorage',
    function ($scope, adminService, submissionService, $localStorage) {
    submissionService.getSubmissions().then(function (response) {
        $scope.submissions = response.data;
    });
    
    $scope.acceptAll = function () {
        submissionService.submissionAcceptAll($localStorage.currentUser.data._id, function(response){
            $scope.message = response.message;
            if(response.success == true){
                $scope.status = 'success';
                submissionService.getSubmissions().then(function (response) {
                    $scope.submissions = response.data;
                });
            }
            else{
                $scope.status = 'danger';
            }
        })
    }

}]);