app.controller('dashboardController', ['$scope', 'adminService', 'userService', '$localStorage', 'AclService', 'submissionService', function ($scope, adminService, userService, $localStorage, AclService, submissionService) {
    $scope.can = AclService.can;
    $scope.submissions = [];
    $scope.reviews = '';
    $scope.allSubmissions = '';

    $scope.init = function () {
        if($localStorage.currentUser){
            userService.getSubmittedPapers($localStorage.currentUser.data._id, function(response){
                $scope.submissions = response;
                $scope.submissions.forEach(function (submission) {
                    userService.getUserById(submission.main_author).then(function (response) {
                        submission.main_author_name = response.data.first_name + ' ' + response.data.last_name;
                    });
                });
            });
            userService.getReviewedPapers($localStorage.currentUser.data._id, function(response){
                $scope.reviews = response;
            });
            userService.getReviewsForAuthorSubmissions($localStorage.currentUser.data._id).then(function (response) {
                $scope.reviewsForAuthorSubmissions = response.data[0];
            })

        }
        if($scope.can('isAuthor') && $scope.can('isReviewer')){
            $scope.limitTo = 1;
        }
        else if($scope.can('isAuthor')){
            $scope.limitTo = 2;
        }
        else if($scope.can('isReviewer')){
            $scope.limitTo = 5;
        }
    };
    $scope.init();

    $scope.downloadFile = function(title, location){
        var fileName = title;
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        submissionService.downloadFile(location).then(function (result) {
            var file = new Blob([result.data], {type: 'application/pdf'});
            var fileURL = window.URL.createObjectURL(file);
            a.href = fileURL;
            a.download = fileName;
            a.click();
        });
    };

    $scope.getRatingText = function (rating) {
        switch (rating) {
            case '1':
                return 'Strongly Rejected';
            case '2':
                return 'Rejected';
            case '3':
                return 'Satisfactory Acceptance';
            case '4':
                return 'Fairly Accepted';
            case '5':
                return 'Strongly Accepted';
            default:
                return 'Not yet rated!!'
        }
    }
}]);