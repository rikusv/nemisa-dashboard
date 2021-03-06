import d3 from '../d3';
import {widget_factories} from './widgets/factories'
import {sections} from './individual_sections/sections'
import fetch from 'isomorphic-fetch'
import regeneratorRuntime from 'regenerator-runtime';
import {FormNav} from './form_nav';

const URL = '/api/responses/'
const SURVEY = 2

class Form {
  constructor() {
    this.prepareDOM();
  }


  prepareDOM() {
    this.elSurvey = d3.select('.survey__wrap');
    this.tmplSection = d3.select('.survey__wrap > .block').node().cloneNode(true);
    this.warningContainer = this.elSurvey.select('.form-warning');
    this.tmplSection.appendChild(this.warningContainer.node());
    d3.select(this.tmplSection).selectAll('.survey-block').remove();

    const widgets = this.createWidgetFactories()
    d3.selectAll('.survey__wrap > .block').remove();

    this.formSections = this.createFormSections(widgets);
    this.formNav = new FormNav(this.formSections.length)
    this.formNav.addListener(this);

    this.renderForm(0);
  }

  onBack(page) {
    this.renderForm(page)
  }


  onForward(page) {
    this.renderForm(page)
  }

  renderForm(page) {
    const sections = this.formSections[page];
    this.elSurvey.selectAll('.block').remove()
    this.elSurvey.select('button').remove();

    sections.forEach(section => {
      this.elSurvey.node().appendChild(section.section.node);
    })

    this.addButton();
  }

  addButton() {
    const self = this;
    d3.select('#survey-submit').on('click', function() {
      self.submitSurvey();
    })
  }


  getResult() {
    const result = {}
    this.formSections.forEach(section => {
      section.forEach(subsection => {
        result[subsection.label] = subsection.section.getResult()
      })
    })

    return result;
  }

  createWidgetFactories() {
    const elements = d3.selectAll('.survey__wrap > .block .survey-block');
    const widgetNodes = elements.nodes();

    const widgets = {
      textbox: new widget_factories.textbox(widgetNodes[0].cloneNode(true)),
      select: new widget_factories.select(widgetNodes[1].cloneNode(true)),
      multiradio: new widget_factories.multiradio(widgetNodes[2].cloneNode(true)),
      checkboxes: new widget_factories.checkboxes(widgetNodes[3].cloneNode(true)),
    }

    elements.remove();

    return widgets;
  }

  createFormSections(widgets) {
    const newSection = () => this.tmplSection.cloneNode(true);
    const formSections = [
      [{label: 'demographics', section: new sections.demographics(newSection(), 'Demographic Information', widgets)}],
      [
        {label: 'access', section: new sections.access(newSection(), 'Access', widgets)},
        {label: 'awareness', section: new sections.awareness(newSection(), 'Awareness and Usage', widgets)},
        {label: 'benefits', section: new sections.benefits(newSection(), 'Benefits of ICT/Computers/Mobile Devices', widgets)},
      ],
      [{label: 'g2c', section: new sections.g2c(newSection(), 'Government to Citizen (G2C) Questions', widgets)}],
    ]
    return formSections;

  }

  async submitSurvey() {
    let data = {data: this.getResult()};
    data = flattenObject(data)
    data = { survey: SURVEY, data: data }
    let response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    });

    let result = await response.json();
    window.location.replace('survey-results.html');
  }
}

function flattenObject(ob) {
  let flat = {};
  Object.keys(ob).forEach((key) => {
    if (typeof ob[key] === 'string' || typeof ob[key] === 'number' || ob[key] instanceof Array) {
      flat[key] = ob[key];
    } else {
      flat = {
        ...flat,
        ...flattenObject(ob[key]),
      };
    }
  });
  return flat;
}

const form = new Form();
