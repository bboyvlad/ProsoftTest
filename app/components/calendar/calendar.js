'use strict';

angular.module('proTest.calendar', ['ngResource'])
.value('holidayAPI', '383a96df-47f1-491d-bd21-e29542dfd80a')

.directive('appcalendar', [ '$log', 'ApiOptions', 'holidayAPI', '$http',  function($log, ApiOptions, holidayAPI, $http) {
    return {
        restrict: "E",
        templateUrl: "components/calendar/templates/calendar.html",
        scope: true,
            link: function($scope) {
                $scope.select_api = ApiOptions;
                $scope.apiKey = holidayAPI;
                $scope.select_country = {};
                $http.get('components/calendar/countries.json').
                success(function(data, status, headers, config) {
                    if(status == 200){
                        $scope.select_country = data;
                    }
                });
                $scope.search = function() {
                    if((angular.isDefined($scope.date) && moment($scope.date).isValid()) && $scope.dayslimit > 0 && angular.isDefined($scope.country)){
                        $scope.startWeek = _resetTime(moment($scope.date));
                        $scope.selected = moment($scope.date);
                        $scope.month = $scope.selected.clone();
                        $scope.start = $scope.startWeek.clone();
                        $scope.fromdate = $scope.selected.clone();
                        _getHolidays(holidayAPI, $scope.country, $scope.selected, $scope.selected.month(), $scope);
                    }else {
                        $log.debug(moment($scope.date).isValid());
                        if(!angular.isDefined($scope.date) || !moment($scope.date).isValid()){
                            window.alert('Please enter a valid date "YYYY-MM-DD"')
                        }
                        if(!$scope.dayslimit > 0){
                            window.alert('Please enter a value grater than 0')
                        }
                        if(!angular.isDefined($scope.country)){
                            window.alert('Please select a country from the list')
                        }
                    }
                };
            }
        };

    function _resetTime(date) {
         return date.day(0).hour(0).minute(0).second(0).millisecond(0);
    }

    function _monthConstructor($scope, start, month, fromdate, holiday) {
        $scope.months = Array();
        var limitReach = false, date = start.clone(), monthIndex = date.month(), limitdate = fromdate.clone(), current_month = month.clone();
        limitdate.add($scope.dayslimit, 'days');
        var monthItem = [];
        while(!limitReach){
            var weeks = [];
            while (date.isSameOrBefore(limitdate)) {
                weeks.push({ days: _weekConstructor(date.clone(), current_month, fromdate, limitdate, holiday.holidays ) });
                date.add(weeks[0]['days'].length, "d");
                if(monthIndex !== date.month() && date.month() !== fromdate.month() && weeks.length > 0){
                    monthIndex = date.month();
                    $scope.monthname = date.format('MMMM');
                    date.subtract(1, "d");
                    break;
                };
            }
            limitReach = date.diff(limitdate, 'days') >= 0;
            monthItem.push({details: current_month.format("MMMM, YYYY"),  month: weeks });
            current_month.add(1, 'M');
            _resetTime(date.day(0));
        }
        $scope.months.push(monthItem);
    }

    function _weekConstructor(date, month, fromdate, limitdate, holiday) {
        var days = [];
        var dcount = 0;
        while ((date.isSameOrBefore(limitdate)) && (dcount < 7)) {
            var month_day = date.month();
            var isHoliday = false;
            for(var i=0; i < holiday.length; i++ ){
                if(date.isSame(holiday[i].date)){
                    isHoliday = holiday[i];
                }
            };
            days.push({
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                beforeSelected : date.diff(fromdate, 'days') < 0,
                isCurrentMonth: date.month() === month.month(),
                isWeekend: (date.weekday() === 6) || (date.weekday() === 0),
                isHoliday: isHoliday,
                date: date
            });
            date = date.clone();
            dcount++;
            if(date.month() !== month_day && (date.month() !== fromdate.month() || date.month() === limitdate.month())){
                break;
            }else{
                date.add(1, "d");
            }
        }
        return days;
    }

    function _getHolidays(apiKey ,country ,date ,month, $scope) {
        $http.get('https://holidayapi.com/v1/holidays?key='+$scope.apiKey+'&country='+country+'&year='+date.year()+'&month='+date.format('MM')).
        success(function(data, status, headers, config) {
            $log.debug(data);
            if(status == 200){
                $scope.holidays = data;
                _monthConstructor($scope, $scope.start, $scope.month, $scope.fromdate, $scope.holidays);
            }
        }).
        error(function(data, status, headers, config) {
            $log.debug(data);
            if(status == 400){
                window.alert('Something is wrong on your end')
            }
            if(status == 401){
                window.alert('Unauthorized (did you remember your API key?)')
            }
            if(status == 402){
                window.alert('Payment required (only historical data available is free)')
            }
            if(status == 403){
                window.alert('Forbidden (this API is HTTPS-only)')
            }
            if(status == 429){
                window.alert('Rate limit exceeded')
            }
            if(status == 500){
                window.alert('OH NOES!!~! Something is wrong on our end')
            }
        });
    }
}]).factory('ApiOptions', function ($resource) {
    return [
        { id: '15cc2bfb-2e31-42bc-82f5-d3f103514f4a', name: 'Live API'},
        { id: '383a96df-47f1-491d-bd21-e29542dfd80a', name: 'Test API'},
    ]
});
