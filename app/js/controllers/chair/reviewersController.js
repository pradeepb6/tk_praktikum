app.controller('chairReviewersController', ['$scope', '$http', 'userService',
    function ($scope, $http, userService) {
        $scope.reviewers = '';
        userService.getAllReviewers().then(function (response) {
            $scope.reviewers = response.data;
            $scope.totalItems = $scope.reviewers.length;
        });

        $scope.userReviewsDetails = [];
        $scope.getOtherDetails = function (id) {
            if($scope.userReviewsDetails.length > 0){
                if($scope.userReviewsDetails[0].main_author != id){
                    userService.getReviewedPapers(id, function (response) {
                        $scope.userReviewsDetails = response;
                    })
                }
            }
            else{
                userService.getReviewedPapers(id, function (response) {
                    $scope.userReviewsDetails = response;
                });
            }
        };

        $scope.viewby = 10;
        $scope.currentPage = 1;
        $scope.itemsPerPage = $scope.viewby;
        $scope.maxSize = 10;

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

    }]);