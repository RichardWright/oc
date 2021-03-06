'use strict';

const expect = require('chai').expect;
const injectr = require('injectr');
const sinon = require('sinon');
const _ = require('lodash');

describe('registry : routes : helpers : get-component', () => {
  const mockedComponents = require('../fixtures/mocked-components');
  let fireStub, mockedRepository, GetComponent;

  const initialise = function(params) {
    fireStub = sinon.stub();
    GetComponent = injectr(
      '../../src/registry/routes/helpers/get-component.js',
      {
        '../../domain/events-handler': {
          on: _.noop,
          fire: fireStub
        }
      },
      { console, Buffer, setTimeout }
    );

    mockedRepository = {
      getCompiledView: sinon.stub().yields(null, params.view),
      getComponent: sinon.stub().yields(null, params.package),
      getDataProvider: sinon.stub().yields(null, params.data),
      getTemplates: sinon.stub(),
      getStaticFilePath: sinon.stub().returns('//my-cdn.com/files/')
    };
  };

  describe('when getting a component with success', () => {
    before(done => {
      initialise(mockedComponents['async-error2-component']);
      const getComponent = GetComponent({}, mockedRepository);

      getComponent(
        {
          name: 'async-error2-component',
          headers: {},
          parameters: {},
          version: '1.X.X',
          conf: { baseUrl: 'http://components.com/' }
        },
        () => done()
      );
    });

    it('should fire a component-retrieved event', () => {
      expect(fireStub.args[0][0]).to.equal('component-retrieved');
      expect(fireStub.args[0][1].headers).to.eql({});
      expect(fireStub.args[0][1].name).to.equal('async-error2-component');
      expect(fireStub.args[0][1].parameters).to.eql({});
      expect(fireStub.args[0][1].requestVersion).to.equal('1.X.X');
      expect(fireStub.args[0][1].href).to.equal(
        'http://components.com/async-error2-component/1.X.X'
      );
      expect(fireStub.args[0][1].version).to.equal('1.0.0');
      expect(fireStub.args[0][1].renderMode).to.equal('rendered');
      expect(fireStub.args[0][1].duration).not.to.be.empty;
      expect(fireStub.args[0][1].status).to.equal(200);
    });
  });

  describe('when getting a component with failure', () => {
    before(done => {
      initialise(mockedComponents['async-error2-component']);
      const getComponent = GetComponent({}, mockedRepository);

      getComponent(
        {
          name: 'async-error2-component',
          headers: {},
          parameters: { error: true },
          version: '1.X.X',
          conf: { baseUrl: 'http://components.com/' }
        },
        () => done()
      );
    });

    it('should fire a component-retrieved event', () => {
      expect(fireStub.args[0][0]).to.equal('component-retrieved');
      expect(fireStub.args[0][1].headers).to.eql({});
      expect(fireStub.args[0][1].name).to.equal('async-error2-component');
      expect(fireStub.args[0][1].parameters).to.eql({ error: true });
      expect(fireStub.args[0][1].requestVersion).to.equal('1.X.X');
      expect(fireStub.args[0][1].href).to.equal(
        'http://components.com/async-error2-component/1.X.X?error=true'
      );
      expect(fireStub.args[0][1].version).to.equal('1.0.0');
      expect(fireStub.args[0][1].renderMode).to.equal('rendered');
      expect(fireStub.args[0][1].duration).not.to.be.empty;
      expect(fireStub.args[0][1].status).to.equal(500);
    });
  });
});
