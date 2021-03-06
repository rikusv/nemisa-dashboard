import $ from 'jquery';

export class Charts {
  constructor($grid, dataFilter, charts) {
    const $chartTemplate = $('.components').find('.block-wrapper').first().clone(true);
    $grid.empty();
    charts.forEach((chart) => {
      const $block = $chartTemplate.clone(true);
      const $chartContainer = $block.find('.results-card__chart').append('<div></div>');
      $chartContainer.parents('.block-inner').find('h4')
        .text(dataFilter.dimensions[chart.dimensionName].label);
      $chartContainer.parents('.block-inner').find('.block__label_icon')
        .empty()
        .addClass(`fa-${chart.icon}`);
      $grid.append($block);
      new chart.Class($chartContainer[0], chart.dimensionName, dataFilter, chart.sortOrder);
    });
  }
}
