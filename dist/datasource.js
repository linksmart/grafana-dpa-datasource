'use strict';

System.register(['lodash', './external/jsonpath'], function (_export, _context) {
  "use strict";

  var _, jsonpath, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_externalJsonpath) {
      jsonpath = _externalJsonpath.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('GenericDatasource', GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          this.type = instanceSettings.type;
          this.url = instanceSettings.url;
          this.name = instanceSettings.name;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        _createClass(GenericDatasource, [{
          key: 'query',
          value: function query(options) {

            var query = this.buildQueryParameters(options);
            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            var statementIds = query.targets.map(function (i) {
              return i.id;
            });

            return this.backendSrv.datasourceRequest({
              url: this.url + '/statement//',
              //data: interpolated,
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            }).then(function (r) {
              var data = _.entries(r.data.resources).map(function (p) {
                return p[1];
              }).filter(function (p) {
                return statementIds.indexOf(p.ID) !== -1;
              }).map(function (p) {
                var t, v, jsonPathX, jsonPathY;

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = query.targets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _t = _step.value;

                    if (_t.id === p.ID) {
                      jsonPathX = _t.jsonPathX;
                      jsonPathY = _t.jsonPathY;
                      break;
                    }
                  }
                } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                      _iterator.return();
                    }
                  } finally {
                    if (_didIteratorError) {
                      throw _iteratorError;
                    }
                  }
                }

                try {
                  if (jsonPathX) {
                    t = jsonpath.query(p.lastOutput.ResultValue, jsonPathX).map(function (x) {
                      return new Date(x).getTime();
                    });
                  } else {
                    t = [new Date(p.lastOutput.Time).getTime()];
                  }

                  if (jsonPathY) {
                    v = jsonpath.query(p.lastOutput.ResultValue, jsonPathY);
                  } else {
                    v = [p.lastOutput.ResultValue];
                  }

                  return {
                    'target': p.name, // The field being queried for
                    'datapoints': _.zip(v, t)
                  };
                } catch (e) {
                  // console.log('error', e)
                  return false;
                }
              });

              console.log(data);
              r.data = data;
              return r;
            });
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            return this.backendSrv.datasourceRequest({
              url: this.url + '/',
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
              }
            });
          }
        }, {
          key: 'annotationQuery',
          value: function annotationQuery(options) {
            var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
            var annotationQuery = {
              range: options.range,
              annotation: {
                name: options.annotation.name,
                datasource: options.annotation.datasource,
                enable: options.annotation.enable,
                iconColor: options.annotation.iconColor,
                query: query
              },
              rangeRaw: options.rangeRaw
            };

            return this.backendSrv.datasourceRequest({
              url: this.url + '/annotations',
              method: 'POST',
              data: annotationQuery
            }).then(function (result) {
              return result.data;
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(options) {
            var target = typeof options === "string" ? options : options.name;
            var interpolated = {
              target: this.templateSrv.replace(target, null, 'regex')
            };

            return this.backendSrv.datasourceRequest({
              url: this.url + '/statement//',
              //data: interpolated,
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            }).then(this.mapToTextValue);
          }
        }, {
          key: 'mapToTextValue',
          value: function mapToTextValue(result) {
            return _.entries(result.data.resources).map(function (p) {
              return { text: p[1].name, value: p[0] };
            });
          }
        }, {
          key: 'buildQueryParameters',
          value: function buildQueryParameters(options) {
            var _this = this;

            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.target !== 'select metric';
            });

            var targets = _.map(options.targets, function (target) {
              return {
                id: _this.templateSrv.replace(target.id),
                refId: target.refId,
                hide: target.hide,
                type: target.type || 'timeserie',

                jsonPathX: target.jsonPathX,
                jsonPathY: target.jsonPathY
              };
            });

            options.targets = targets;

            return options;
          }
        }]);

        return GenericDatasource;
      }());

      _export('GenericDatasource', GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
