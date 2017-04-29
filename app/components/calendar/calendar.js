'use strict';

angular.module('proTest.calendar', ['ngResource'])
.value('holidayAPI', '15cc2bfb-2e31-42bc-82f5-d3f103514f4a')

.directive('appcalendar', [ '$log', 'countries', 'holidayAPI', '$http',  function($log, countries, holidayAPI, $http) {
    return {
        restrict: "E",
        templateUrl: "components/calendar/templates/calendar.html",
        scope: true,
            link: function($scope) {
                $scope.select_country = countries;
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
        $http.get('https://holidayapi.com/v1/holidays?key='+apiKey+'&country='+country+'&year='+date.year()+'&month='+date.format('MM')).
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
}])
.factory('countries', function ($resource) {
    return [
        { id: 'AR', name: 'Argentina'},
        { id: 'AO', name: 'Angola'},
        { id: 'AT', name: 'Austria'},
        { id: 'AU', name: 'Australia'},
        { id: 'AW', name: 'Aruba'},
        { id: 'BE', name: 'Belgium'},
        { id: 'BG', name: 'Bulgaria'},
        { id: 'BO', name: 'Bolivia'},
        { id: 'BR', name: 'Brazil'},
        { id: 'CA', name: 'Canada'},
        { id: 'CH', name: 'Switzerland'},
        { id: 'CN', name: 'China'},
        { id: 'CO', name: 'Colombia'},
        { id: 'CZ', name: 'Cze'},
        { id: 'ch', name: 'Republic'},
        { id: 'DE', name: 'Germany'},
        { id: 'DK', name: 'Denmark'},
        { id: 'DO', name: 'Dominic'},
        { id: 'an', name: 'Republic'},
        { id: 'EC', name: 'Ecuador'},
        { id: 'ES', name: 'Spain'},
        { id: 'FI', name: 'Finland'},
        { id: 'FR', name: 'France'},
        { id: 'GB', name: 'United Kingdom'},
        { id: 'GB-ENG', name: 'England'},
        { id: 'GB-NIR', name: 'Northern Ireland'},
        { id: 'GB-SCT', name: 'Scotland'},
        { id: 'GB-WLS', name: 'Wales'},
        { id: 'GR', name: 'Greece'},
        { id: 'GT', name: 'Guatemala'},
        { id: 'HK', name: 'Ho'},
        { id: 'ng', name: 'Kong'},
        { id: 'HN', name: 'Honduras'},
        { id: 'HR', name: 'Croatia'},
        { id: 'HU', name: 'Hungary'},
        { id: 'ID', name: 'Indonesia'},
        { id: 'IE', name: 'Ireland'},
        { id: 'IN', name: 'India'},
        { id: 'IL', name: 'Israel'},
        { id: 'IT', name: 'Italy'},
        { id: 'JP', name: 'Japan'},
        { id: 'KZ', name: 'Kazakhstan'},
        { id: 'LS', name: 'Lesotho'},
        { id: 'LU', name: 'Luxembourg'},
        { id: 'MG', name: 'Madagascar'},
        { id: 'MQ', name: 'Martinique'},
        { id: 'MT', name: 'Malta'},
        { id: 'MU', name: 'Mauritius'},
        { id: 'MX', name: 'Mexico'},
        { id: 'MZ', name: 'Mozambique'},
        { id: 'NL', name: 'Netherlands'},
        { id: 'NO', name: 'Norway'},
        { id: 'PE', name: 'Peru'},
        { id: 'PK', name: 'Pakistan'},
        { id: 'PH', name: 'Philippines'},
        { id: 'PL', name: 'Poland'},
        { id: 'PR', name: 'Puer'},
        { id: 'to', name: 'Rico'},
        { id: 'PT', name: 'Portugal'},
        { id: 'PY', name: 'Paraguay'},
        { id: 'RE', name: 'Réunion'},
        { id: 'RU', name: 'Russia'},
        { id: 'SC', name: 'Seychelles'},
        { id: 'SE', name: 'Sweden'},
        { id: 'SG', name: 'Singapore'},
        { id: 'SI', name: 'Slovenia'},
        { id: 'ST', name: 'Sao Tome and Principe'},
        { id: 'SK', name: 'Slovakia'},
        { id: 'TN', name: 'Tunisia'},
        { id: 'TR', name: 'Turkey'},
        { id: 'UA', name: 'Ukraine'},
        { id: 'US', name: 'United States'},
        { id: 'UY', name: 'Uruguay'},
        { id: 'VE', name: 'Venezuela'}
    ]
});
