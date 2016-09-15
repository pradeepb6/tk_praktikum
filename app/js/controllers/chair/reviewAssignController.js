app.controller('chairReviewAssignController', ['$scope', '$http', 'userService', 'submissionService', 'reviewService',
    function ($scope, $http, userService, submissionService, reviewService) {
        // currentUser
        $scope.currentUser = '';

        userService.getReviewers().then(function (response) {
            $scope.reviewers = response.data;
        });

        $scope.assignedSubmissions = [];
        $scope.message = "Saved";


        $scope.saveReviews = function () {
            var selectedSubmissions = [];
            //noinspection JSDuplicatedDeclaration
            for(var i = 0; i< $scope.selectedSubmissionsIndex.length; i++){
                if($scope.selectedSubmissionsIndex[i] == true){
                    selectedSubmissions.push($scope.submissions[i]._id);
                }
            }
            reviewService.assignReviewsForUser($scope.currentUser._id, selectedSubmissions).then(function (response) {
                submissionService.getSubmissionsWithCount().then(function (response1) {
                    $scope.submissions = response1.data;
                });
                $('.modal-body').animate({ scrollTop: 0 }, 'slow');
                if (response.data.success == true) {
                    $scope.message = response.data.message;
                } else {
                    $scope.message = response.data.message;
                }
            });
            //noinspection JSDuplicatedDeclaration
            for(var i=0; i < $scope.reviewers.length; i++){
                if($scope.reviewers[i]._id == $scope.currentUser._id){
                    $scope.reviewers[i].assigned_submissions = [];
                    for(var j=0; j<selectedSubmissions.length; j++){
                        $scope.reviewers[i].assigned_submissions.push($scope.getSubmissionObject(selectedSubmissions[j]));
                    }
                    return;
                }
            }

        };

        $scope.getSubmissionObject = function (submission_id) {
            for(var i=0; i < $scope.submissions.length; i++){
                if($scope.submissions[i]._id == submission_id)
                    return $scope.submissions[i];
            }
        };

        $scope.assignForUser = function (user) {
            $scope.selectedSubmissionsIndex = [];
            $scope.currentUser = user;
            $scope.message = null;
            $scope.assignedSubmissions = [];
            $scope.userReviews = [];
            $scope.submissions = [];
            $scope.userSubmissions = [];
            $scope.totalAssignedPapersForUser = 0;
            submissionService.getSubmissionsWithCount().then(function (response1) {

                // get user submission
                submissionService.getSubmissionByUser(user._id).then(function (response2) {
                    $scope.userSubmissions = response2.data;

                    // get submissions assigned to user for review
                    reviewService.getReviewsForUser(user._id).then(function (response3) {
                        $scope.userReviews = response3.data;
                        $scope.submissions = response1.data;

                        // populate selectedSubmissionsIndex
                        if ($scope.userReviews) {
                            $scope.totalAssignedPapersForUser = $scope.userReviews.length;
                            for (var i = 0; i < $scope.submissions.length; i++) {
                                $scope.selectedSubmissionsIndex.push(false);
                                for (var j = 0; j < $scope.userReviews.length; j++) {
                                    if($scope.submissions[i]._id == $scope.userReviews[j].submission_id){
                                        $scope.selectedSubmissionsIndex[i] = true;
                                        break;
                                    }
                                }
                            }
                        }
                    });
                });
            });
        };

        $scope.isAuthorForSubmission = function(user_id, submission_id){
            // check if the submission_id is in the userSubmissions array
            for(var i = 0; i < $scope.userSubmissions.length; i++){
                if($scope.userSubmissions[i]._id == submission_id){
                    return true;
                }
            }
            return false;
        };

        $scope.isSubmissionAssigned = function (submission_id) {
            var retVal = false;
            if ($scope.userReviews) {
                for (var i = 0; i < $scope.userReviews.length; i++) {
                    if ($scope.userReviews[i].submission_id == submission_id) {
                        retVal = true;
                    }
                }
            }
            return retVal;
        }

    }]);