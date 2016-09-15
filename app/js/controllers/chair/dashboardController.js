app.controller('chairDashboardController', ['$scope', 'adminService', function ($scope, adminService) {
    // Chart Stuffs
    $scope.keywordStatsOption = {
        chart: {
            type: 'pieChart',
            height: 500,
            x: function (d) {
                return d.key;
            },
            y: function (d) {
                return d.value;
            },
            showLabels: true,
            duration: 500,
            labelThreshold: 0.01,
            labelSunbeamLayout: true,
            legend: {
                margin: {
                    top: 5,
                    right: 0,
                    bottom: 5,
                    left: 0
                }
            }
        }
    };
    $scope.institutionStatsOption = {
        chart: {
            type: 'pieChart',
            height: 500,
            x: function (d) {
                return d.key;
            },
            y: function (d) {
                return d.value;
            },
            showLabels: true,
            duration: 500,
            labelThreshold: 0.01,
            labelSunbeamLayout: true,
            legend: {
                margin: {
                    top: 5,
                    right: 35,
                    bottom: 5,
                    left: 0
                }
            }
        }
    };
    $scope.countryStatsOption = {
        chart: {
            type: 'pieChart',
            height: 500,
            x: function (d) {
                return d.key;
            },
            y: function (d) {
                return d.value;
            },
            showLabels: true,
            duration: 500,
            labelThreshold: 0.01,
            labelSunbeamLayout: true,
            legend: {
                margin: {
                    top: 5,
                    right: 35,
                    bottom: 5,
                    left: 0
                }
            }
        }
    };

    $scope.submissionStatusStatsOption = {
        chart: {
            type: 'discreteBarChart',
            height: 500,
            x: function (d) {
                return d._id;
            },
            y: function (d) {
                return d.count;
            },
            showValues: true,
            duration: 500,
            xAxis: {
                axisLabel: 'Submission Status'
            },
            yAxis: {
                axisLabel: 'Count',
                axisLabelDistance: -10
            }
        }
    };

    $scope.userCountStatsOption = {
        chart: {
            type: 'discreteBarChart',
            height: 500,
            x: function (d) {
                return d.key;
            },
            y: function (d) {
                return d.value;
            },
            showValues: true,
            duration: 500,
            xAxis: {
                axisLabel: 'Users'
            },
            yAxis: {
                axisLabel: 'Count',
                axisLabelDistance: -10
            }
        }
    };

    $scope.reviewEvaluationStatsOption = {
        chart: {
            type: 'discreteBarChart',
            height: 500,
            x: function (d) {
                return d._id;
            },
            y: function (d) {
                return d.count;
            },
            showValues: true,
            duration: 500,
            xAxis: {
                axisLabel: 'Evaluation'
            },
            yAxis: {
                axisLabel: 'Count',
                axisLabelDistance: -10
            }
        }
    };

     $scope.reviewExpertiseStatsOption = {
        chart: {
            type: 'discreteBarChart',
            height: 500,
            x: function (d) {
                return d._id;
            },
            y: function (d) {
                return d.count;
            },
            showValues: true,
            duration: 500,
            xAxis: {
                axisLabel: 'Expertise'
            },
            yAxis: {
                axisLabel: 'Count',
                axisLabelDistance: -10
            }
        }
    };


    adminService.getInstitutionStatistics().then(function (response) {
        $scope.institutionStats = response.data;
    });

    adminService.getCountryStatistics().then(function (response) {
        $scope.countryStats = response.data;
    });

    adminService.getKeywordCountStatistics().then(function (response) {
        $scope.keywordStats = response.data;
    });

    adminService.getSubmissionStatusStatistics().then(function (response) {
        // Bar chart requires weird format
        $scope.submissionStatusStats = [];
        $scope.submissionStatusStats[0] = {key: 'Submission Status Statistics'}
        $scope.submissionStatusStats[0].values = response.data;
    });

    adminService.getUserCountStatistics().then(function (response) {
        // Bar chart requires weird format
        $scope.userCountStats = [];
        $scope.userCountStats[0] = {key: 'User Statistics'}
        $scope.userCountStats[0].values = response.data;
    });

    adminService.getReviewEvaluationStatistics().then(function(response){
        $scope.reviewEvaluationStats = [];
        $scope.reviewEvaluationStats[0] = {key: 'Review Evaluation Statistics'}
        $scope.reviewEvaluationStats[0].values = response.data;
    });

    adminService.getReviewExpertiseStatistics().then(function(response){
        $scope.reviewExpertiseStats = [];
        $scope.reviewExpertiseStats[0] = {key: 'Reviewer Expertise Statistics'}
        $scope.reviewExpertiseStats[0].values = response.data;
    });
    // End Chart Stuffs
}]);