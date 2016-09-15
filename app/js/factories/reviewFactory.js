app.factory('reviewService', ['$rootScope', '$http', function ($rootScope, $http) {
    var service = {};

    // get the reviews made by this user
    service.getReviewsForUser = function(userId) {
        return $http.get('api/chair/review/' + userId);
    };

    // get the reivew mande by this user for this submission
    service.getReview = function(userId, submissionId) {
        return $http.get('api/chair/review/' + userId + '/' + submissionId);
    };

    // get the individual review by ID
    service.getReviewById = function(reviewId, userId) {
        return $http.get('api/reviewer/review/' + reviewId + '/' + userId);
    };

    // get all reviews
    service.getReviews = function() {
        return $http.get('api/chair/reviews');
    };

    service.getReviewsForSubmission = function(submission_id){
        return $http.get('api/chair/review/submission/id/' + submission_id);
    };

    service.saveReview = function(review, callback) {
        return $http.post('api/reviewer/review/', {reviewData: review})
            .success(function (response) {
                callback(response);
            });
    };

    service.assignReviewsForUser = function(user_id, submission_ids){
        return $http.post('api/chair/assignreviewsforuser', {user_id: user_id, submission_ids: submission_ids});
    };

    service.getAssignedSubmissions = function(user_id){
        return $http.get('api/reviewer/assigned_submissions/'+user_id);
    };

    service.downloadFile = function(id){
        return $http.get('api/reviewer/download/' + id, { responseType: 'arraybuffer' });
    };

    service.getRatingText = function (rating) {
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

    return service;
}]);