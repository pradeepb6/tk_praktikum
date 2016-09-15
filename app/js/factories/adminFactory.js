/**
 * Created by PRAB on 22.08.2016.
 */
app.factory('adminService', function($rootScope, $http) {
    var conference = {};

    conference.getConf = function() {
        return $http.get('api/public/conf/');
    };
    conference.saveConf = function(conf, cb) {
       return $http.post('api/chair/conf/', {conference: conf})
            .success(function(response){
                cb(response);
            });
    };

    conference.getInstitutionStatistics = function(){
        return $http.get('api/chair/statistics/submission/institution');
    }

    conference.getCountryStatistics = function(){
        return $http.get('api/chair/statistics/submission/country');
    }

    conference.getKeywordCountStatistics = function(){
        return $http.get('api/chair/statistics/keywords/count');
    }

    // Get submission status statistics
    conference.getSubmissionStatusStatistics = function(){
        return $http.get('api/chair/statistics/submissionstatus/count');
    }

    conference.getUserCountStatistics = function(){
        return $http.get('api/chair/statistics/users/count');
    }

    conference.getReviewEvaluationStatistics = function(){
        return $http.get('api/chair/statistics/review/evaluation');
    }

    conference.getReviewExpertiseStatistics = function(){
        return $http.get('api/chair/statistics/review/expertise');
    }

    return conference;
});