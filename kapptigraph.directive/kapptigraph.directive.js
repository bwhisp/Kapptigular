/**
 * Created by bwhisp on 23/06/15.
 */
(function () {
    'use strict';

    angular
        .module('test')
        .directive('kapptigraph', kapptigraph);

    function kapptigraph($interval, $http) {

        /**
         * This directive will enable us to plot graphs.
         * @type {{restrict: string}}
         */
        var directive;

        function link(scope, element, attrs) {
            var generateQuery = function (ops, metrics, duration) {
                /**
                 * This function generates the query for the given information
                 * and launches it by calling getFromDB.
                 * op : (string) Operation to be executed on the metric
                 * metric : (string) Metric to be recovered
                 * duration : (string) We retrieve data from now - duration, until now
                 * aggregation : (string) In order to have a suitable amount of points,
                 *                we group the results by a certain amount of time
                 */

                var corresp = {'1d': '1m', '12h': '30s', '1h': '3s', '30m': '2s', '10m': '1s'};
                // Make mean as the default operation
                ops = ops === null ? 'mean' : op;
                // Make value as the default metric
                metrics = metrics === null ? 'response_time' : metric;
                // Make 1 hour as the default duration
                duration = duration === null ? '1h' : duration;

                var metrics_str = ''
                    , ops_str = '';

                metrics.forEach()


                var aggregation = corresp[duration];
                return 'SELECT ' + ops + '(value) FROM ' + metrics + ' WHERE time > now() - ' + duration + ' GROUP BY time(' + aggregation + ')';
            };

            var getFromDB = function (infos) {
                /**
                 * This function executes the query on the database
                 * query : (string) The query that was built by generateQuery
                 */
                var url = 'http://178.62.125.228:8086/query?db=rand_data&q=' + generateQuery(infos.ops, infos.metrics, infos.duration);
                $http.get(url)
                    .success(function (data) {
                        for (var i = 0; i < data.results[0].series.length; i++) {
                            scope.data[i].values = data.results[0].series[i].values.map(function (point) {
                                return {
                                    x: new Date(point[0]),
                                    y: point[1] !== null ? point[1] : 0
                                };
                            });
                        }
                    })
                    .error(function (data, status) {
                        console.log(data + 'erreur' + status)
                    });
            };


            scope.$watch(attrs.duration, function (value) {
                scope.duration = value;
                getFromDB(scope.infos);
            });

            element.on('$destroy', function () {
                $interval.cancel(timeoutId);
            });

            var timeoutId = $interval(function () {
                getFromDB(scope.infos);
            }, 200000);

            getFromDB(scope.infos);
            scope.data = [
                {
                    values: [],
                    key: 'Response time',
                    color: '#2ca02c'
                },
                {
                    values: [],
                    key: 'Sms response time',
                    color: '#0079a3'
                }
            ];
        }

        directive = {
            restrict: 'E',
            templateUrl: 'app/main/kapptigraph.directive.html',
            scope: {
                options: '=',
                infos: '='
            },
            link: link
        };
        return directive;
    }


})();
