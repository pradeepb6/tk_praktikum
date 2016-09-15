app.controller('importantDatesEventsController', ['$scope', 'adminService', function ($scope, adminService) {
    adminService.getConf().then(function (response) {
        $scope.conference = response.data;
        var now = new Date();
        var confStart = new Date($scope.conference.start_date);
        var confEnd = new Date($scope.conference.end_date);
        var submissionStart = new Date($scope.conference.submission_start_date);
        var submissionEnd = new Date($scope.conference.submission_end_date);
        var reviewStart = new Date($scope.conference.review_start_date);
        var reviewEnd = new Date($scope.conference.review_end_date);

        if (confStart > now) {
            $scope.aboutConferenceMessage = 'Conference starts in ' + (moment.duration(confStart - now)).humanize();
        }
        else if (moment.duration(now - confStart).days == 0) {
            $scope.aboutConferenceMessage = 'Conference starts from today';
        }
        else {
            if (confEnd < now) {
                $scope.aboutConferenceMessage = 'Conference ended  ' + (moment.duration(now - confEnd)).humanize() + ' ago';
            } else if (moment.duration(confEnd - now).days == 0) {
                $scope.aboutConferenceMessage = 'Conference ends today';
            } else {
                $scope.aboutConferenceMessage = 'Conference ends in ' + (moment.duration(confEnd - now)).humanize();
            }
        }

        if (reviewStart > now) {
            $scope.aboutReviewMessage = 'Review starts in ' + (moment.duration(reviewStart - now)).humanize();
        } else if (moment.duration(now - reviewStart).days == 0) {
            $scope.aboutReviewMessage = 'Review starts from today';
        }
        else {

            if (reviewEnd < now) {
                $scope.aboutReviewMessage = 'Review ended  ' + (moment.duration(reviewEnd - now)).humanize() + ' ago';
            } else if (moment.duration(now - reviewEnd).days == 0) {
                $scope.aboutReviewMessage = 'Review ends in today';
            } else {
                $scope.aboutReviewMessage = 'Review ends in ' + (moment.duration(reviewEnd - now)).humanize();
            }
        }

        if (submissionStart > now) {
            $scope.aboutSubmissionMessage = 'Submission starts in ' + (moment.duration(submissionStart - now)).humanize();
        } else if (moment.duration(now - submissionStart).days == 0) {
            $scope.aboutSubmissionMessage = 'Submission starts from today';
        }
        else {

            if (submissionEnd < now) {
                $scope.aboutSubmissionMessage = 'Submission ended  ' + (moment.duration(submissionEnd - now)).humanize() + ' ago';
            } else if (moment.duration(now - submissionEnd).days == 0) {
                $scope.aboutSubmissionMessage = 'Submission ends in today';
            } else {
                $scope.aboutSubmissionMessage = 'Submission ends in ' + (moment.duration(submissionEnd - now)).humanize();
            }
        }

    });

}]);