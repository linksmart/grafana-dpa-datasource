import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv)  {
    super($scope, $injector);

    this.scope = $scope;
    this.uiSegmentSrv = uiSegmentSrv;
    this.target.id = this.target.id || 'select metric';
    this.target.type = this.target.type || 'timeserie';

    this.target.jsonPathX = this.target.jsonPathX || '';
    this.target.jsonPathY = this.target.jsonPathY || '';
  }

  getOptions() {
    return this.datasource.metricFindQuery(this.target)
      .then(r => {
        return r;
      })
    //.then(this.uiSegmentSrv.transformToSegments(true));
      // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }


}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
