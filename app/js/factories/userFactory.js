app.factory('userService', ['$rootScope', '$http', function($rootScope, $http) {
    var service = {};


    service .saveUser = function(userDetails, id, callback){
        $http.post('api/user/save/'+id, {userDetails: userDetails})
            .success(function(response){
                callback(response);
            })
    };

    service.changePassword = function(password, email, callback){
        $http.post('api/user/password/change', {email:email, password: password})
            .success(function(response){
                callback(response);
            })
    };

    service.getUser = function(id, callback) {
        $http.get('api/user/get/'+id)
            .success(function (response) {
                callback(response)
            })
    };

    service.getSubmittedPapers = function (id, callback) {
        $http.get('api/author/get/submissions/'+id)
            .success(function (response) {
                callback(response);
            })
    };

    service.getReviewedPapers = function (id, callback) {
        $http.get('api/reviewer/get/reviews/'+id)
            .success(function (response) {
                callback(response);
            })
    };

    service.getReviewsForAuthorSubmissions = function(userId){
        return $http.get('api/reviewer/get/reviews/author/' + userId);
    };

    service.updateLastLogin = function(email) {
        return $http.post('api/user/updateLastLogin/'+email, {});
    };

    // get the list of all users
    service.getUsers = function(){
        return $http.get('api/chair/users/');
    };

    service.getRoles = function(callback){
        $http.get('api/public/roles/get').success(function (response) {
            callback(response);
        });
    };

    service.getReviewers = function(){
        return $http.get('api/chair/reviewers');
    };

    service.getAllReviewers = function(){
        return $http.get('api/chair/reviewers/all');
    };

    service.getAllAuthors = function(){
        return $http.get('api/chair/authors/all');
    };

    service.getUserById = function(id){
        return $http.get('api/user/get/id/' + id);
    };

    service.getCoAuthors = function(submission_id){
        return $http.get('api/chair/get/coauthors/' + submission_id);
    };
    service.deleteAccount = function (email, password, callback) {
        $http.post('api/user/deleteAccount', {email:email, password: password})
            .success(function(response){
                callback(response);
            });
    };

    return service;
}]);

