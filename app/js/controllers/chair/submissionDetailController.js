app.controller('chairSubmissionDetailController', ['$scope', '$stateParams', '$state', 'adminService', 'reviewService', 'submissionService', 'userService', '$localStorage',
    function ($scope, $stateParams, $state, adminService, reviewService, submissionService, userService, $localStorage) {

        submissionService.getSubmission($stateParams.id).then(function (response) {
            $scope.submission = response.data;
            userService.getUserById($scope.submission.main_author).then(function (response) {
                $scope.author = response.data;
            });
            userService.getCoAuthors($stateParams.id).then(function (response) {
                $scope.coAuthors = response.data;
            });
            if($scope.submission.co_authors.length > 0){
                userService.getCoAuthors($scope.submission._id).then(function (response) {
                    $scope.coAuthors = response.data;
                })
            }
        });

        $scope.modifySubmission = function (status) {
            submissionService.submissionStatusChangeByChair($scope.submission._id, status, $localStorage.currentUser.data._id, function(response){
                $scope.submission= response;
            })
        };

        $scope.getRatingText = reviewService.getRatingText;

        reviewService.getReviewsForSubmission($stateParams.id).then(function (response) {
            $scope.reviews = response.data;
        });

        adminService.getConf().then(function(response){
            $scope.conf = response.data;
            // $scope.reviewEnded = new Date($scope.conf.review_end_date) <= new Date();
            $scope.reviewEnded = true;
            $scope.afterSubmissionAndBeforeReview = new Date($scope.conf.submission_end_date) <= new Date() && new Date($scope.conf.review_start_date) >= new Date();
        });

    }]);