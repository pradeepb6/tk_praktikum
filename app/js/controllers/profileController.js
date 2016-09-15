app.controller('profileController', ['$scope', 'userService', 'authService', '$rootScope', '$localStorage', '$timeout' , '$location', function ($scope, userService, authService, $rootScope, $localStorage, $timeout, $location) {
    $scope.saveSuccessMessage = '';
    $scope.status = '';
    $scope.submitForm = function () {
        // check to make sure the form is completely valid
        if ($scope.userForm.$valid) {
            userService.saveUser($scope.user, $localStorage.currentUser.data._id, function(response){
                if(response.success == true){
                    $scope.status= 'success';
                    $scope.saveSuccessMessage = "Your profile details are saved successfully!";
                }else{
                    $scope.status='danger';
                    $scope.saveSuccessMessage = "Some error in saving your profile. Please try in sometime.";
                }
            });
            $scope.userForm.$setPristine();
        }
    };

    $scope.submitPasswordChange = function () {
      if($scope.passwordChangeForm.$valid) {
          userService.changePassword($scope.changePassword, $localStorage.currentUser.data.email, function(response){
              if(response.success == true){
                  $scope.status= 'success';
                  $scope.saveSuccessMessage = "Your password is changed successfully! Please login with the new password";
                  $timeout(function () {
                      authService.logout(function(response){
                          $rootScope.userIsLoggedIn = authService.isLoggedIn();
                          $location.path("/login");
                      });
                  }, 3000);
              }else{
                  $scope.status='danger';
                  $scope.saveSuccessMessage = "Some error changing your password. Please try in sometime.";
              }
          });
          // console.log($scope.user);
          $scope.passwordChangeForm.$setPristine();
          $('#passwordModal').modal('hide');
          }
    };

    $scope.deleteAccount = function () {
        if($scope.deleteAccountForm.$valid) {
            userService.deleteAccount($localStorage.currentUser.data.email, $scope.password, function(response){
                if(response.success == true){
                    $scope.status= 'success';
                    $scope.saveSuccessMessage = "Your data is successfully deleted! Please register again to access the website!";
                    $timeout(function () {
                        authService.logout(function(response){
                            $rootScope.userIsLoggedIn = authService.isLoggedIn();
                            $location.path("/login");
                        });
                    }, 3000);
                }else{
                    $scope.status='danger';
                    $scope.saveSuccessMessage = response.message;
                }
            });
            // console.log($scope.user);
            $scope.deleteAccountForm.$setPristine();
            $('#deleteAccountModal').modal('hide');
        }
    };

    $scope.init = function () {
        if ($scope.userForm) {
            $scope.userForm.$setPristine();
        }
        if($localStorage.currentUser){
            userService.getUser($localStorage.currentUser.data._id, function(response){
                $scope.user = response;
            })
        }
       userService.getRoles(function(response){
           $scope.allRoles = response;
        });
    };
    $scope.init();
}]);