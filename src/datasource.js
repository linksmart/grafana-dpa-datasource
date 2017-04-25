import _ from "lodash";
import jsonpath from './external/jsonpath';

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
  }

  query(options) {

    var query = this.buildQueryParameters(options);
    query.targets = query.targets.filter(t => !t.hide);

    var statementIds = query.targets.map(i => (i.id));

    return this.backendSrv.datasourceRequest({
      url: this.url + '/statement//',
      //data: interpolated,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).then(r => {
      var data = _.entries(r.data.resources)
        .map(p => (p[1]))
        .filter(p => (statementIds.indexOf(p.ID) !== -1))
        .map(p => {
          var t, v, jsonPathX, jsonPathY;

          for (let t of query.targets) {
            if (t.id === p.ID) {
              jsonPathX = t.jsonPathX;
              jsonPathY = t.jsonPathY;
              break;
            }
          }

          try {
            if (jsonPathX) {
              t = jsonpath.query(p.lastOutput.ResultValue, jsonPathX).map(x => ((new Date(x)).getTime()));
            }
            else {
              t = [(new Date(p.lastOutput.Time)).getTime()];
            }

            if (jsonPathY) {
              v = jsonpath.query(p.lastOutput.ResultValue, jsonPathY);
            }
            else {
              v = [p.lastOutput.ResultValue];
            }

            return {
              'target': p.name, // The field being queried for
              'datapoints': _.zip(v, t)
            }
          }
          catch (e) {
            // console.log('error', e)
            return false;
          }


        });

      console.log(data);
      r.data = data;
      return r;

    });

  }

  testDatasource() {
    return this.backendSrv.datasourceRequest({
      url: this.url + '/',
      method: 'GET'
    }).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

  annotationQuery(options) {
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
    }).then(result => {
      return result.data;
    });
  }

  metricFindQuery(options) {
    var target = typeof (options) === "string" ? options : options.name;
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

  mapToTextValue(result) {
    return _.entries(result.data.resources)
      .map(p => ({ text: p[1].name, value: p[0] }))
  }

  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metric';
    });

    var targets = _.map(options.targets, target => {
      return {
        id: this.templateSrv.replace(target.id),
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
}
