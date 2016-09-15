app.controller('chairAuthorsController', ['$scope', '$http', 'userService',
    function ($scope, $http, userService) {
        $scope.authors = '';
        $scope.userSubmissionDetails = [];
        userService.getAllAuthors().then(function (response) {
            $scope.authors = response.data;
            $scope.totalItems = $scope.authors.length;
        });


        $scope.getOtherDetails = function (id) {
            $scope.userSubmissionDetails = [];
            userService.getSubmittedPapers(id, function (response) {
                $scope.userSubmissionDetails = response;
            });

        };

        //Pagination try
        $scope.viewby = 10;
        $scope.currentPage = 1;
        $scope.itemsPerPage = $scope.viewby;
        $scope.maxSize = 5;

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };
    }]);