app.controller('submissionController', ['$scope', '$http', 'Upload', '$timeout', '$localStorage', '$state', '$stateParams', 'submissionService', 'userService', '$sce', 'adminService', '$location',
    function ($scope, $http, Upload, $timeout, $localStorage, $state, $stateParams, submissionService, userService, $sce, adminService, $location) {

        $scope.submission = {};
        $scope.submission.id = $stateParams.id;
        $scope.submission.keywords = [];
        $scope.coAuthors = [];
        $scope.showFile = false;
        $scope.keywords = [];
        $scope.tempCoAuthors = [];
        $scope.tempFileName = '';
        $scope.isSubmissionOpen = true;
        $scope.allowModify = false;
        $scope.coAuthorsChanged = true;
        var fileName = '';
        var coAuthor = {fname: '', lname: '', email: ''};
        $scope.init = function () {
            if ($stateParams.id) {
                $scope.editButton = true;
                submissionService.getSubmissionById($stateParams.id)
                    .then(function (response) {
                        $scope.submission = response.data;
                        $scope.allowModify = $scope.submission.status != 'incomplete';
                        $scope.submission.id = $stateParams.id;
                        $scope.tempFileName = $scope.submission.pdf_location;
                        $scope.keywords = $scope.submission.keywords;
                        if($scope.submission.title && $scope.submission.abstract && $scope.submission.pdf_location){
                            $scope.setFormValid = true;
                            $scope.submissionForm.file.$setValidity("required", true);
                            $scope.submissionForm.submissionTitle.$setValidity("required", true);
                        }
                        else if($scope.submission.title && $scope.submission.pdf_location){
                            $scope.submissionForm.file.$setValidity("required", true);
                            $scope.submissionForm.submissionTitle.$setValidity("required", true);
                        }
                        if ($scope.submission.co_authors.length > 0) {
                            for (var i = 0; i < $scope.submission.co_authors.length; i++) {
                                userService.getUser($scope.submission.co_authors[i], function (response) {
                                    coAuthor.fname = response.first_name;
                                    coAuthor.lname = response.last_name;
                                    coAuthor.email = response.email;
                                    $scope.coAuthors.push(coAuthor);
                                    $scope.tempCoAuthors.push(coAuthor);
                                    coAuthor = {fname: '', lname: '', email: ''};
                                })
                            }
                        }
                    });
            }
            adminService.getConf().then(function (response) {
                $scope.conference = response.data;
                var now = new Date();
                var submissionStart = new Date($scope.conference.submission_start_date);
                var submissionEnd = new Date($scope.conference.submission_end_date);
                if (submissionStart > now) {
                    $scope.isSubmissionOpen = false;
                    $scope.submissionOpenMessage =  "Sorry!! Submission is not opened yet" ;
                    $scope.submissionInfo = "Submission will be open on " + moment(submissionStart).format('Do MMM YYYY') +". Please visit later.";
                }
                else{
                    $scope.isSubmissionOpen = true;
                }
                if(now > submissionEnd){
                    $scope.isSubmissionOpen = false;
                    $scope.submissionCloseMessage = "Sorry!! Submission is closed";
                }
            });

        };
        $scope.init();

        $scope.downloadFile = function(){
            var fileName = $scope.submission.title;
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            submissionService.downloadFile($scope.submission.pdf_location).then(function (result) {
                var file = new Blob([result.data], {type: 'application/pdf'});
                var fileURL = window.URL.createObjectURL(file);
                a.href = fileURL;
                a.download = fileName;
                a.click();
            });
        };

        $scope.doesExist = function(coAuthor) {
            return $scope.tempCoAuthors.indexOf(coAuthor) !== -1;
        };
        $scope.getFileName = function(files, events, b) {
            $scope.tempFileName = files[0].name;
        };


        function randomString(len, an){
            an = an&&an.toLowerCase();
            var str="", i=0, min=an=="a"?10:0, max=an=="n"?10:62;
            for(;i++<len;){
                var r = Math.random()*(max-min)+min <<0;
                str += String.fromCharCode(r+=r>9?r<36?55:61:48);
            }
            return str;
        }

        $scope.uploadPdf = function (file, status) {
            $scope.submission.status = status;
            $scope.submission.co_authors = $scope.coAuthors;
            if ($scope.submission.pdf_location || file && $scope.submission.title) {
                $scope.keywords = [];
                for (var i = 0; i < $scope.submission.keywords.length; i++) {
                    $scope.keywords.push($scope.submission.keywords[i].text);
                }
                $scope.submission.keywords = $scope.keywords;
                $scope.submission.last_modified_by = $localStorage.currentUser.data._id;
                if(file){
                    fileName = randomString(15);
                    file = Upload.rename(file, fileName);
                    $scope.submission.pdf_location = fileName;
                    file.upload = Upload.upload({

                        url: '/api/author/uploads',
                        data: {
                            submissionDetails: $scope.submission, file: file
                        }
                    });
                    file.upload.then(function (response) {
                        file.message = response.data;
                        if(response.data.success == true && status == 'incomplete'){
                            $scope.status = 'success';
                            $scope.message = "Your submission is saved!!";
                            if(!$scope.submission._id){
                                $timeout(function() {
                                    $location.path('/dashboard');
                                }, 3000);
                            }

                        }else if(response.data.success == true && status == 'complete'){
                            $scope.status = 'success';
                            $scope.message = "Your submission was successful!!";
                            $scope.allowModify = true;
                            if(!$scope.submission._id){
                                $timeout(function() {
                                    $location.path('/dashboard');
                                }, 3000);
                            }
                        }
                        else{
                            $scope.status = 'danger';
                            $scope.message = response.message;
                        }
                    }, function (response) {
                        if (response.status > 0)
                            $scope.errorMsg = response.status + ': ' + response.data;
                    }, function (evt) {
                        // Math.min is to fix IE which reports 200% sometimes
                        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                    });
                }
                else{
                    $http.post('/api/author/uploads', {submissionDetails: $scope.submission})
                        .success(function(response){
                            if(response.success == true && status == 'incomplete'){
                                $scope.status = 'success';
                                $scope.message = "Your submission is saved!!";
                                if(!$scope.submission._id){
                                    $timeout(function() {
                                        $location.path('/dashboard');
                                    }, 3000);
                                }
                            }else if(response.success == true && status == 'complete'){
                                $scope.status = 'success';
                                $scope.message = "Your submission was successful!!";
                                $scope.allowModify = true;
                                if(!$scope.submission._id){
                                    $timeout(function() {
                                        $location.path('/dashboard');
                                    }, 3000);
                                }
                            }
                            else{
                                $scope.status = 'danger';
                                $scope.message = response.message;
                            }
                        })
                }
            } else {
                if($scope.submission.title){
                    if(status == 'incomplete'){
                        $http.post('/api/author/uploads', {submissionDetails: $scope.submission})
                            .success(function(response){
                                if(response.success == true){
                                    $scope.status = 'success';
                                    $scope.message = "Your submission is saved!!";
                                    if(!$scope.submission._id){
                                        $timeout(function() {
                                            $location.path('/dashboard');
                                        }, 3000);
                                    }
                                }
                                else{
                                    $scope.status = 'danger';
                                    $scope.message = response.message;
                                }
                            })
                    }
                }
                else {
                    $scope.status = 'danger';
                    $scope.message = "Title is mandatory to save as draft!!";
                }
            }

        };

        $scope.isEdit = -1;

        $scope.saveChanges = function () {
            coAuthor = {fname: $scope.fname, lname: $scope.lname, email: $scope.email};
            if ($scope.isEdit >= 0) {
                $scope.removeCoAuthor($scope.isEdit);
            }
            if (!$scope.coAuthors.some(function (coAuthor) {
                    return coAuthor.email === $scope.email
                })) {
                $scope.coAuthors.push(coAuthor);
                resetForm();
                $('#coAuthorModal').modal('hide');
                $scope.coAuthorError = '';
                $scope.coAuthorsChanged= angular.equals($scope.tempCoAuthors,$scope.coAuthors);
                $scope.submissionForm.$setDirty(true);
            }
            else {
                resetForm();
                $scope.coAuthorError = "The email you have entered in already added as a Co-Author.";
            }
        };

        $scope.onBlur = function () {
            if ($scope.isEdit < 0) {
                if ($scope.coAuthors.some(function (coAuthor) {
                        return coAuthor.email === $scope.email
                    })) {
                    $scope.coAuthorError = "The email you have entered in already added as a Co-Author.";
                }
                else {
                    $scope.coAuthorError = '';
                }
            }
        };

        function resetForm() {
            $scope.fname = '';
            $scope.lname = '';
            $scope.email = '';
            $scope.coAuthorForm.$setPristine(true);
            $scope.coAuthorForm.$setUntouched();
        }

        $scope.removeCoAuthor = function (index) {
            $scope.coAuthors.splice(index, 1);
            $scope.coAuthorsChanged= angular.equals($scope.tempCoAuthors,$scope.coAuthors);
            $scope.submissionForm.$setDirty(true);
        };

        $scope.editCoAuthor = function (index) {
            $scope.isEdit = index;
            $('#coAuthorModal').modal('show');
            $scope.fname = $scope.coAuthors[index].fname;
            $scope.lname = $scope.coAuthors[index].lname;
            $scope.email = $scope.coAuthors[index].email;
        };

        $scope.pdfDisplay = function (show) {
            $scope.showFile = show;
            var fileName = $scope.submission.title;
            var fileURL;
            // var a = document.createElement("a");
            if(show && !$scope.filePath){

            // document.body.appendChild(a);
            // a.style = "display: none";
            submissionService.downloadFile($scope.submission.pdf_location).then(function (result) {
                var file = new Blob([result.data], {type: 'application/pdf'});
                fileURL = window.URL.createObjectURL(file);
                $scope.filePath = $sce.trustAsResourceUrl(fileURL);
                // a.download = fileName;
                // a.click();
            });}
        };

        // This is used when author decides to withdraw the submission
        $scope.withDrawSubmission = function () {
            submissionService.submissionStatusChangeByAuthor($scope.submission._id, 'withdrawn', $localStorage.currentUser.data._id, function(response){
                $scope.submission= response;
                $scope.status = 'success';
                $scope.message = 'You have successfully withdrawn the submission!!'
            })
        }

    }]);