app.controller('chairUserDetailController', ['$scope', '$stateParams', '$state', 'adminService', 'userService', 'submissionService', 'reviewService',
 function ($scope, $stateParams, $state, adminService, userService, submissionService, reviewService) {
     $scope.getRatingText = reviewService.getRatingText;

    userService.getUserById($stateParams.id).then(function(response){
        $scope.user = response.data;
    });

    userService.getSubmittedPapers($stateParams.id, function(response){
        $scope.submissions = response;
    });

    reviewService.getReviewsForUser($stateParams.id).then(function(response){
        $scope.reviews = response.data;
    });
}]);