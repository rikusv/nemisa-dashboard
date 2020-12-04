import $ from 'jquery';
import * as dc from 'dc';
import d3 from '../d3';

export class RowChart extends dc.RowChart {
  constructor(container, dimensionName, dataFilter, order) {
    super(container);
    this.container = container;
    this.currentDimension = dataFilter.dimensions[dimensionName].dimension;
    this.grouping = this.currentDimension.group().reduceCount();
    this.prepareDOM();
    $(container).parents('.block-inner').find('h4')
      .text(dataFilter.dimensions[dimensionName].label);
    this
      .dimension(this.currentDimension)
      .group(this.grouping)
      .elasticX(true);
    if (order) {
      this.ordering((d) => order.indexOf(d.key));
    }
  }

  prepareDOM() {
    d3.select(this.container).select('.chart').style('display', 'none');
  }

  _drawChart() {
    const self = this;
    super._drawChart();
    this._tip = d3.tip().attr('class', 'tooltip').html((d) => `${d.key}: ${d.value}`);
    this.svg().call(this._tip);
    this.selectAll(`g.${this._rowCssClass}`)
      .on('mouseover', function(ev, d) {
        self._tip.show(d, this);
      })
      .on('mouseout', function(ev, d) {
        self._tip.hide(d, this);
      });
  }
}
