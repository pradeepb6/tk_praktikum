app.controller('chairReviewMasterController', ['$scope', 'adminService', 'reviewService', 'userService',
    function ($scope, adminService, reviewService, userService) {

        $scope.reviewersNames = '';
        $scope.init = function(){
            //get all the reviews
            reviewService.getReviews().then(function (response) {
                $scope.reviews = response.data;
            });

            // get all the reviewers' details
            userService.getAllReviewers().then(function (response) {
                $scope.reviewersNames = response.data;
            });
        };

        $scope.init();

        // This will return the reviewer name
        $scope.getReviewerName = function (user_id) {
            for (var i = 0; i < $scope.reviewersNames.length; i++)
                if ($scope.reviewersNames[i]._id == user_id) {
                    var reviewerName = $scope.reviewersNames[i].first_name + ' ' + $scope.reviewersNames[i].last_name;
                    return reviewerName;
                }
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