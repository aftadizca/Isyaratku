import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {RNCamera} from 'react-native-camera-tflite';
import outputs from './Output.json';
import _ from 'lodash';

let _currentInstant = 0;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      output: '',
    };
  }

  processOutput({data}) {
    const probs = _.map(data, (item) => _.round(item / 255.0, 2));
    console.log(probs);
    const orderedData = _.chain(probs)
      .zip(outputs)
      .orderBy(0, 'desc')
      .map((item) => [item[0], item[1]])
      .value();
    const outputData = _.chain(orderedData)
      .take(2)
      .map((item) => `${item[1]}: ${item[0]}`)
      //.map((item) => `${item[1]}`)
      .join('\n')
      .value();

    //console.log(orderedData);
    const time = Date.now() - (_currentInstant || Date.now());
    const output = `${outputData}\nTime:${time} ms`;
    this.setState((state) => ({
      output,
    }));
    _currentInstant = Date.now();
  }

  render() {
    const modelParams = {
      file: 'quantized_model.tflite',
      inputDimX: 128,
      inputDimY: 128,
      outputDim: 5,
      freqms: 0,
    };
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
          permissionDialogTitle={'Permission to use camera'}
          permissionDialogMessage={
            'We need your permission to use your camera phone'
          }
          onModelProcessed={(data) => this.processOutput(data)}
          modelParams={modelParams}>
          <Text style={styles.cameraText}>{this.state.output}</Text>
        </RNCamera>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  cameraText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
});
