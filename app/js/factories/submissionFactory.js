app.factory('submissionService', ['$rootScope', '$http', function ($rootScope, $http) {
    var service = {};
    // get the submission made by this user
    service.getSubmissionByUser = function(userId) {
        return $http.get('api/chair/user/submissions/' + userId);
    };

    // get all submissions
    service.getSubmissions = function(){
        return $http.get('api/chair/submissions');
    };

    // get all submissions with review counts
    service.getSubmissionsWithCount = function(){
        return $http.get('api/chair/submissionsdetails');
    };

    service.getSubmission = function(submission_id){
        return $http.get('api/chair/submission/id/' + submission_id);
    };

    //Get the paper details by paper id
    service.getSubmissionById = function(id){
        return $http.get('api/author/submission/' + id);
    };

    service.downloadFile = function(id){
        return $http.get('api/author/download/' + id, { responseType: 'arraybuffer' });
    };

    // This is used by a chair person
    service.submissionStatusChangeByChair = function (id, status, user_id, callback) {
        $http.post('api/chair/submission/status/' +id, {status: status, modified_user: user_id})
            .success(function (response) {
                callback(response);
        });
    };

    // This will be used by an author
    service.submissionStatusChangeByAuthor = function (id, status, user_id, callback) {
        $http.post('api/author/submission/status/' +id, {status: status, modified_user: user_id})
            .success(function (response) {
                callback(response);
            });
    };

    //This will accept all the papers of all only which are complete.
    service.submissionAcceptAll = function (user_id, callback) {
        $http.post('api/chair/submission/status/change/all', {modified_user: user_id})
            .success(function (response) {
                callback(response);
            });
    };

    return service;

}]);