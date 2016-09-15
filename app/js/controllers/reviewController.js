app.controller('reviewController', ['$scope', 'reviewService', 'adminService', '$localStorage', '$state', '$stateParams', 'userService', '$location','$sce',
    function ($scope, reviewService, adminService, $localStorage, $state, $stateParams, userService, $location, $sce) {

        $scope.review_status = ['Not Reviewed', 'Submission Updated after Review', 'Reviewed'];
        $scope.expertise = [['label-default', 'None'], ['label-warning', 'Basic'], ['label-info', 'Sufficient'], ['label-primary', 'Good'], ['label-success', 'Expert']];
        $scope.eval = [['label-danger', 'Strongly Rejected'], ['label-default', 'Rejected'], ['label-primary', 'Satisfactory Acceptance'], ['label-success', 'Fairly Accepted'], ['label-success', 'Strongly Accepted']];


        $scope.getAllSubmissionslist = function () {
            if ($localStorage.currentUser) {
                reviewService.getAssignedSubmissions($localStorage.currentUser.data._id).then(function (response) {
                    $scope.reviews = response.data;
                    $scope.reviews.forEach(function (review) {
                        if (review.submission_details)
                            userService.getUserById(review.submission_details.main_author).then(function (response) {
                                review.submission_details.main_author = response.data.last_name + ", " + response.data.first_name;
                            });
                        if (review.submission_details) {
                            var co_authors = review.submission_details.co_authors;
                            review.submission_details.co_authors = [];
                            co_authors.forEach(function (id) {
                                userService.getUserById(id).then(function (response) {
                                    review.submission_details.co_authors.push(" [" + response.data.last_name + ", " + response.data.first_name + "] ");
                                });
                            });
                        }
                    });
                });
            }
        };

        $scope.getAllSubmissionslist();

        $scope.getReviewStatus = function (i) {
            if ($scope.reviews[i].reviewed_date) {
                if ($scope.reviews[i].submission_details) {
                    if ($scope.reviews[i].submission_details.date_submitted > $scope.reviews[i].reviewed_date) {
                        return 1;
                    } else {
                        return 2;
                    }
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        };
        $scope.downloadFile = function (index) {
            var fileName = $scope.reviews[index].submission_details.title;
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            reviewService.downloadFile($scope.reviews[index].submission_details.pdf_location).then(function (result) {
                var file = new Blob([result.data], {type: 'application/pdf'});
                var fileURL = window.URL.createObjectURL(file);
                a.href = fileURL;
                a.download = fileName;
                a.click();
            });
        };

        $scope.pdfDisplay = function (show, index) {
            $scope.reviews[index].showFile = show;
            var fileName = $scope.reviews[index].submission_details.title;
            var fileURL;
            // var a = document.createElement("a");
            if (show && !$scope.reviews[index].filePath) {

                // document.body.appendChild(a);
                // a.style = "display: none";
                reviewService.downloadFile($scope.reviews[index].submission_details.pdf_location).then(function (result) {
                    var file = new Blob([result.data], {type: 'application/pdf'});
                    fileURL = window.URL.createObjectURL(file);
                    $scope.reviews[index].filePath = $sce.trustAsResourceUrl(fileURL);
                    // a.download = fileName;
                    // a.click();
                });
            }
        };


        $scope.undoChanges = function (edit_mode) {
            if (edit_mode) {
                $scope.review = angular.copy($scope.temp_review);
            }

            $scope.edit_mode = !edit_mode;
            $scope.reviewForm.$setPristine();
            $scope.reviewForm.$setUntouched();
        };
        $scope.resetReviewForm = function () {
            $scope.review.overall_evaluation = '';
            $scope.review.summary = '';
            $scope.review.expertise = '';
            $scope.review.major_strong_points = '';
            $scope.review.weak_points = '';
            $scope.review.detailed_comments = '';
            $scope.reviewForm.$setPristine();
            $scope.reviewForm.$setUntouched();
        };
        $scope.submitReview = function () {
            if ($scope.reviewForm.$valid) {
                $scope.review.user_id = $localStorage.currentUser.data._id;
                reviewService.saveReview($scope.review, function (response) {
                    if (response.success == true) {
                        $scope.status = 'success';
                        $scope.saveMessage = " Review Successfully Saved.";
                        $scope.reviewForm.$setPristine();
                        $scope.review.reviewed_date = new Date();
                        $scope.temp_review = angular.copy($scope.review);
                        $scope.getAllSubmissionslist();

                    } else {
                        $scope.status = 'danger';
                        $scope.saveMessage = "Error Updating review";
                    }
                });

            }
        };
        $scope.init = function () {
            // $scope.review.page = "";
            // $scope.review.user_id = '';
            // $scope.review.submission_id = '';
            // $scope.review.reviewed_date = new Date();
            $scope.regards = "Best Regards,";
            $scope.signature = "Tk Conference Management System";

            adminService.getConf().then(function (response) {
                $scope.conference = response.data;
                var now = new Date();
                var reviewStart = new Date($scope.conference.review_start_date);
                var reviewEnd = new Date($scope.conference.review_end_date);
                if (reviewStart > now) {
                    $scope.isReviewOpen = false;
                    $scope.ReviewOpenMessage =  "Sorry!! Review is not opened yet" ;
                    $scope.message = "Review will be open on " + moment(reviewStart).format('Do MMM YYYY') +". Please visit later.";
                }
                else {
                    $scope.isReviewOpen = true;
                }
                if (now > reviewEnd) {
                    $scope.isReviewOpen = false;
                    $scope.ReviewCloseMessage = "Sorry!! Review is closed";
                }

                if ($stateParams.id) {
                    reviewService.getReviewById($stateParams.id, $localStorage.currentUser.data._id)
                        .then(function (response) {
                            if(response.data)
                                $scope.review = response.data;
                            else
                                $location.path('dashboard');
                        });
                }

                $scope.temp_review = angular.copy($scope.review);
            });
        };
        $scope.init();
    }
])
    .directive('reviewForm', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/review.html',
            scope: {review: '=shadow'},
            controller: 'reviewController'
        };
    });
