app.controller('loginController', ['$scope', '$location', 'authService', 'userService', 'AclService', '$localStorage',
    function($scope, $location, authService, userService, AclService, $localStorage){

    $scope.submitLoginForm = function(){
        if($scope.loginForm.$valid){
            $scope.loginForm.$setPristine();
            $scope.loginForm.$setUntouched();
        }
    };

    $scope.init = function(){
        if($scope.loginForm){
            $scope.loginForm.$setPristine();
            $scope.loginForm.$setUntouched();
        }
    };

    $scope.init();

    $scope.loginFormDisplay =true;
    $scope.registerFormDisplay = false;
    $scope.resetFormDisply = false;

    $scope.openRegisterForm = function(){
        $scope.loginFormDisplay = false;
        $scope.registerFormDisplay = true;
        $scope.resetFormDisply = false;
        $scope.loginForm.$setUntouched();
        $scope.loginForm.$setPristine();

    };

    $scope.openLoginForm = function(){
        $scope.loginFormDisplay = true;
        $scope.registerFormDisplay = false;
        $scope.resetFormDisply = false;
        $scope.registerForm.$setUntouched();
        $scope.registerForm.$setPristine();
        $scope.resetForm.$setUntouched();
        $scope.resetForm.$setPristine();
    };

    $scope.openResetForm = function(){
        $scope.loginFormDisplay = false;
        $scope.registerFormDisplay = false;
        $scope.resetFormDisply = true;
        $scope.loginForm.$setUntouched();
        $scope.loginForm.$setPristine();
    };

    $scope.login = function(){
            authService.login($scope.loginEmail, $scope.loginPassword, function(response){
            if(response.success == true){
                if(response.user.last_login){
                    for(var i=0; i <$localStorage.currentUser.data.roles.length; i++)
                        AclService.attachRole($localStorage.currentUser.data.roles[i].role);
                    if(AclService.can('isChair')){
                        $location.path('/chair/dashboard');
                    }
                    else{
                        $location.path('/dashboard');
                    }
                }
                else
                    $location.path('/profile');
                userService.updateLastLogin($scope.loginEmail);
            }else{
                $scope.loginError = response.message;
            }
        })
    };

    $scope.register = function(){
        authService.register($scope.registerEmail, $scope.registerPassword, $scope.role_choice, function(response){
            if(response.success == true){
                $location.path('/login');
                $scope.message = "You have successfully Registered. Kindly verify your email and login!";
                $scope.openLoginForm();
            }else{
                $scope.registerError = response.message;
            }
        })
    };

    $scope.forgotPassword = function(){
        authService.forgotPassword($scope.resetEmail, function(response){
            if(response.success == true){
                $scope.message = response.message;
            }else{
                $scope.resetError = response.message;
            }
        })
    };

}]);