import arrayMutators from 'final-form-arrays';
import { client, ParameterType } from 'ontology-dapi';
import * as React from 'react';
import { Field, Form } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { RouterProps } from 'react-router';

import * as PrivateChain from './constants/private-chain';

// tslint:disable:max-line-length
export const SmartContract: React.SFC<RouterProps> = (props) => {
  async function onScCall(values: any) {
    const contract: string = values.contract;
    const method: string = values.method;
    const gasPrice: number = Number(values.gasPrice);
    const gasLimit: number = Number(values.gasLimit);
    const requireIdentity: boolean = values.requireIdentity;
    const parametersRaw: any[] = values.parameters;

    const parameters = parametersRaw.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));
    try {
      const result = await client.api.smartContract.invoke({
        contract,
        method,
        parameters,
        gasPrice,
        gasLimit,
        requireIdentity
      });
      // tslint:disable-next-line:no-console
      console.log('onScCall finished, result:' + JSON.stringify(result));

      const transaction = await client.api.network.getTransaction({
        txHash: result.transaction
      });

      // tslint:disable-next-line:no-console
      console.log('onGetTransaction: ' + JSON.stringify(transaction));
    } catch (e) {
      alert('onScCall canceled');
      // tslint:disable-next-line:no-console
      console.log('onScCall error:', e);
    }
  }

  async function onScCallRead(values: any) {
    const contract: string = values.contract;
    const method: string = values.method;
    const parametersRaw: any[] = values.parameters;

    const parameters = parametersRaw.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));

    try {
      const result = await client.api.smartContract.invokeRead({ contract, method, parameters });
      // tslint:disable-next-line:no-console
      console.log('onScCallRead finished, result:' + JSON.stringify(result));
    } catch (e) {
      alert('onScCallRead canceled');
      // tslint:disable-next-line:no-console
      console.log('onScCallRead error:', e);
    }
  }

  function convertValue(value: string, type: ParameterType) {
    switch (type) {
      case 'Boolean':
        return Boolean(value);
      case 'Integer':
        return Number(value);
      case 'ByteArray':
        return value;
      case 'String':
        return client.api.utils.strToHex(value);
    }
  }

  async function onScDeploy(values: any) {
    const code: string = values.code;
    const name: string = values.name;
    const version: string = values.version;
    const author: string = values.author;
    const email: string = values.email;
    const description: string = values.description;
    const needStorage: boolean = values.needStorage;
    const gasPrice: number = Number(values.gasPrice);
    const gasLimit: number = Number(values.gasLimit);

    try {
      const result = await client.api.smartContract.deploy({
        code,
        name,
        version,
        author,
        email,
        description,
        needStorage,
        gasPrice,
        gasLimit
      });
      alert('onScDeploy finished, result:' + JSON.stringify(result));
    } catch (e) {
      alert('onScDeploy canceled');
      // tslint:disable-next-line:no-console
      console.log('onScDeploy error:', e);
    }
  }

  function onBack() {
    props.history.goBack();
  }

  return (
    <div>
      <h2>ScCall</h2>
      <Form
        initialValues={{
          contract: PrivateChain.contract,
          method: 'Hello',
          gasPrice: '500',
          gasLimit: '100000000',
          parameters: [{ type: 'String', value: 'World' }]
        }}
        mutators={Object.assign({}, arrayMutators) as any}
        onSubmit={onScCall}
        render={({
          form: {
            mutators: { push, pop }
          },
          handleSubmit
        }) => (
          <form onSubmit={handleSubmit}>
            <h4>Contract</h4>
            <Field name="contract" component="input" />

            <h4>Method</h4>
            <Field name="method" component="input" />

            <h4>Gas price</h4>
            <Field name="gasPrice" component="input" type="number" />

            <h4>Gas limit</h4>
            <Field name="gasLimit" component="input" type="number" />

            <h4>Require identity sign</h4>
            <Field name="requireIdentity" component="input" type="checkbox" />

            <h4>Parameters</h4>
            <button type="button" onClick={() => push('parameters', { type: 'Integer', value: '' })}>
              Add Parameter
            </button>
            <FieldArray name="parameters">
              {({ fields }) =>
                fields.map((name, index) => (
                  <div key={index}>
                    <label>Type</label>
                    <Field name={`${name}.type`} component="select">
                      <option value="Boolean">Boolean</option>
                      <option value="Integer">Integer</option>
                      <option value="ByteArray">ByteArray</option>
                      <option value="String">String</option>
                    </Field>
                    <label>Value</label>
                    <Field name={`${name}.value`} component="input" />
                    <span onClick={() => fields.remove(index)} style={{ cursor: 'pointer' }}>
                      ❌
                    </span>
                  </div>
                ))
              }
            </FieldArray>
            <br />
            <br />
            <button type="submit">Call SC</button>
          </form>
        )}
      />
      <hr />
      <h2>ScCall read</h2>
      <Form
        initialValues={{
          contract: PrivateChain.contract,
          method: 'Add',
          parameters: [{ type: 'Integer', value: '5' }, { type: 'Integer', value: '4' }]
        }}
        mutators={Object.assign({}, arrayMutators) as any}
        onSubmit={onScCallRead}
        render={({
          form: {
            mutators: { push, pop }
          },
          handleSubmit
        }) => (
          <form onSubmit={handleSubmit}>
            <h4>Contract</h4>
            <Field name="contract" component="input" />

            <h4>Method</h4>
            <Field name="method" component="input" />

            <h4>Parameters</h4>
            <button type="button" onClick={() => push('parameters', { type: 'Integer', value: '' })}>
              Add Parameter
            </button>
            <FieldArray name="parameters">
              {({ fields }) =>
                fields.map((name, index) => (
                  <div key={index}>
                    <label>Type</label>
                    <Field name={`${name}.type`} component="select">
                      <option value="Boolean">Boolean</option>
                      <option value="Integer">Integer</option>
                      <option value="ByteArray">ByteArray</option>
                      <option value="String">String</option>
                    </Field>
                    <label>Value</label>
                    <Field name={`${name}.value`} component="input" />
                    <span onClick={() => fields.remove(index)} style={{ cursor: 'pointer' }}>
                      ❌
                    </span>
                  </div>
                ))
              }
            </FieldArray>
            <br />
            <br />
            <button type="submit">Call SC ReadOnly</button>
          </form>
        )}
      />
      <hr />
      <h2>ScDeploy</h2>
      <Form
        initialValues={{
          code:
            '57c56b6c766b00527ac46c766b51527ac4616c766b00c303416464876c766b52527ac46c766b52c3645d00616c766b51c3c0529c009c6c766b55527ac46c766b55c3640e00006c766b56527ac46243006c766b51c300c36c766b53527ac46c766b51c351c36c766b54527ac46c766b53c36c766b54c3617c6521006c766b56527ac4620e00006c766b56527ac46203006c766b56c3616c756653c56b6c766b00527ac46c766b51527ac46151c576006c766b00c36c766b51c393c461681553797374656d2e52756e74696d652e4e6f74696679616c766b00c36c766b51c3936c766b52527ac46203006c766b52c3616c7566',
          name: 'Test contract',
          version: '1.0.0',
          author: 'Mr. Nobody',
          email: 'nobody@nowhere.com',
          description: 'Just a plain contract',
          needStorage: false,
          gasPrice: '500',
          gasLimit: '100000000'
        }}
        onSubmit={onScDeploy}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <h4>code</h4>
            <Field name="code" component="textarea" />

            <h4>name</h4>
            <Field name="name" component="input" />

            <h4>version</h4>
            <Field name="version" component="input" />

            <h4>author</h4>
            <Field name="author" component="input" />

            <h4>email</h4>
            <Field name="email" component="input" />

            <h4>description</h4>
            <Field name="description" component="input" />

            <h4>need storage</h4>
            <Field name="needStorage" component="input" type="checkbox" />

            <h4>Gas price</h4>
            <Field name="gasPrice" component="input" type="number" />

            <h4>Gas limit</h4>
            <Field name="gasLimit" component="input" type="number" />

            <br />
            <br />
            <button type="submit">Deploy SC</button>
          </form>
        )}
      />
      <hr />
      <button onClick={onBack}>Back</button>
    </div>
  );
};
