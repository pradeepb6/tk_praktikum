/**
 * Created by PRAB on 17.08.2016.
 */
app.controller('conferenceController', ['$scope', 'adminService', '$window', function ($scope, adminService, $window) {
    $scope.conf = {};


    $scope.init = function () {
        $scope.popups = [];
        for (i = 0; i < 6; i++) {
            $scope.popups[i] = {
                opened: false, isValid: true, dateOptions: {
                    formatYear: 'yy',
                    maxDate: new Date(2020, 5, 22),
                    minDate: new Date(2016, 9, 6),
                    startingDay: 1
                },
                inlineOptions: {}
            };
        }


        $scope.popups[0].dateOptions.dateDisabled = function (data) {
            return data.date < new Date()
        };

        adminService.getConf().then(function (response) {
            $scope.conf = response.data;
            $scope.conf.start_date = new Date(response.data.start_date);
            $scope.conf.end_date = new Date(response.data.end_date);
            $scope.conf.submission_start_date = new Date(response.data.submission_start_date);
            $scope.conf.submission_end_date = new Date(response.data.submission_end_date);
            $scope.conf.review_start_date = new Date(response.data.review_start_date);
            $scope.conf.review_end_date = new Date(response.data.review_end_date);
            $scope.popups[0].dateDisabled = $scope.conf.start_date < new Date();
            $scope.validateDateRange();
        });

    };

    $scope.init();

    $scope.inlineOptions = {
        minDate: new Date(),
        showWeeks: true
    };

    $scope.open = function (id) {
        $scope.popups[id].opened = true;
    };

    $scope.toggleMin = function () {
        for (i = 0; i < 6; i++) {
            $scope.popups[i].inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
            $scope.popups[i].dateOptions.minDate = $scope.inlineOptions.minDate;

        }
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];
    $scope.toggleMin();

    $scope.validateDateRange = function () {
        $scope.status = {success: false, error: false};
        var dates = [$scope.conf.start_date, $scope.conf.end_date, $scope.conf.submission_start_date, $scope.conf.submission_end_date, $scope.conf.review_start_date, $scope.conf.review_end_date];
        $scope.popups[0].isValid = dates[0] <= dates[1] && dates[0] <= dates[2] && dates[0] <= dates[3] && dates[0] <= dates[4] && dates[0] <= dates[5];
        $scope.popups[1].isValid = dates[0] <= dates[1] && dates[2] <= dates[1] && dates[3] <= dates[1] && dates[4] <= dates[1] && dates[5] <= dates[1];
        $scope.popups[2].isValid = dates[0] <= dates[2] && dates[2] <= dates[1];
        $scope.popups[3].isValid = dates[3] <= dates[1] && dates[0] <= dates[3] && dates[2] <= dates[3];
        $scope.popups[4].isValid = dates[4] <= dates[1] && dates[2] <= dates[4] && dates[0] <= dates[4];
        $scope.popups[5].isValid = dates[5] <= dates[1] && dates[0] <= dates[5] && dates[4] <= dates[5] && dates[3] <= dates[5];

        $scope.popups[1].dateOptions.minDate = dates[0];
        $scope.popups[2].dateOptions.minDate = dates[0];
        $scope.popups[2].dateOptions.maxDate = dates[1];
        $scope.popups[3].dateOptions.minDate = dates[2];
        $scope.popups[3].dateOptions.maxDate = dates[1];
        $scope.popups[4].dateOptions.minDate = dates[0];
        $scope.popups[4].dateOptions.maxDate = dates[1];
        $scope.popups[5].dateOptions.minDate = dates[3];
        $scope.popups[5].dateOptions.maxDate = dates[1];

        if($scope.conferenceForm){
            $scope.conferenceForm.date0.$setValidity("size", $scope.popups[0].isValid);
            $scope.conferenceForm.date1.$setValidity("size", $scope.popups[1].isValid);
            $scope.conferenceForm.date2.$setValidity("size", $scope.popups[2].isValid);
            $scope.conferenceForm.date3.$setValidity("size", $scope.popups[3].isValid);
            $scope.conferenceForm.date4.$setValidity("size", $scope.popups[4].isValid);
            $scope.conferenceForm.date5.$setValidity("size", $scope.popups[5].isValid);
        }

    };
    $scope.status = '';
    // $scope.validateDateRange();
    $scope.saveConference = function () {
        $scope.conf.id = 1;
        adminService.saveConf($scope.conf, function (response) {

            if (response.success == true) {
                $scope.message = "Successfully Saved.";
                $scope.status = 'success';
            } else {
                $scope.message = "Error during Updating.";
                $scope.status = 'danger';
            }
            $window.scrollTo(0, 0);
        });
        $scope.conferenceForm.$setPristine();
    };
    // $scope.onTextChange = function () {
    //     $scope.status = '';
    // }

}]);