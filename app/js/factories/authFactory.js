app.factory('authService', ['$localStorage', '$http', function($localStorage, $http){
    var service = {};
    service.login = login;
    service.logout = logout;
    service.register = register;
    service.isLoggedIn = isLoggedIn;
    service.forgotPassword = forgotPassword;
    return service;

    function login(email, password, callback){
        $http.post('/api/public/signin', {email : email, password: password})
            .success(function(response){
                //login successful if response.success = true
                if(response.success == true){
                    //store email, roles and token in localstorage
                    $localStorage.currentUser = {
                        data: response.user,
                        token: response.token};

                    // add jwt token to auth header for all requests made my $http service
                    //$http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
                    $http.defaults.headers.common.token = $localStorage.currentUser.token;
                    // execute callback with true to indicate successful login
                    callback(response);
                } else {
                    callback(response);
                }
            });
    }

    function logout(callback){
        // remove user from local storage and clear http auth header
        delete $localStorage.currentUser;
        $http.defaults.headers.common.Authorization = '';
        callback(true);
    }

    function register(email, password, role_choice, callback){
        $http.post('/api/public/signup', {email: email, password: password, role_choice: role_choice})
            .success(function(response){
                callback(response);
            })
    }

    function forgotPassword(email, callback){
        $http.post('/api/public/resetemail', {email:email})
            .success(function(response){
                callback(response);
            });
    }

    function isLoggedIn(){
        return($localStorage.currentUser)? true : false;
    }
}]);