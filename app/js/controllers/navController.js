app.controller('navController', ['$scope', 'AclService', function ($scope, AclService) {
    $scope.can = AclService.can;
}]);