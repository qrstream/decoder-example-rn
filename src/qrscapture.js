import React from 'react';
import {Text, StyleSheet, Platform, View, Dimensions, TouchableOpacity} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {Button} from 'react-native-elements';

import Decoder from 'qrstream-decoder';

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text>Please authorize to use camera in </Text>
    <Text>"Settings -> Privacy -> Camera -> QRStream"</Text>
  </View>
);

export default class QRStreamCapture extends React.Component {
  constructor(props) {
    super(props);
    this.onGoHome = props.onGoHome;
    this.showResult = props.showResult;

    this.qrstream = Decoder();
    this.state = {
      status: 0,
      done: undefined,
      metadata: {},
      line: "Scan Metadata first please!"
    };
  }


  _parseMetadata = json => {
    this.qrstream.init(json);
  }
  _parsePayload = json => {
    let seq = this.qrstream.feed(json);
    return seq;
  }

  _handleBarCodeRead = json => {
    let line;
    let status;
    let done;

    switch (this.state.status) {
      case 0:
        this._parseMetadata(json.data);
        let metadata = this.qrstream.metadata;
        if (this.qrstream.status === 0) {
          line = "Scan Metadata first please!";
        } else {
          line = Array.from(this.qrstream.missingIDs).join(", ");
          line = "Please scan the QRCode Stream!\n" + "Frames not transferred: [" + line + "]";
        }
        status = this.qrstream.status;
        done = new Array(this.qrstream.metadata.count);
        for(let i = 0; i < done.length; i++) {
          done[i] = false;
        }
        this.setState({line, status, done, metadata})
        break;
      case 1:
        let seq = this._parsePayload(json.data);
        line = Array.from(this.qrstream.missingIDs).join(", ");
        line = "Please scan the QRCode Stream!\n" + "Frames not transferred: [" + line + "]";
        status = this.qrstream.status;
        done = this.state.done;
        if (seq && seq >= 1 && seq <= done.length) {
          done[seq - 1] = true;
        }
        this.setState({line, status, done});
        break;
      case 2:
        // console.log("Finished!");
        status = this.qrstream.status;
        this.setState({status});
        this.showResult(this.qrstream.metadata, this.qrstream.fetch());
        break;
      default:
        break;
    }
  };

  render() {
    var {height, width} = Dimensions.get('window');
    let size = Math.min(height / 2, width) - 20;
    let topMargin = 30;
    let ratio = 1.0 * (size + 20 + topMargin) / height;
    let progressWidth = this.state.done && (100.0 / this.state.done.length);
    let getBorderRadius = function(key, length) {
      switch (key) {
        case 0:
          return {borderTopLeftRadius: 5, borderBottomLeftRadius: 5}
        case length - 1:
          return {borderTopRightRadius: 5, borderBottomRightRadius: 5}
        default:
          return {}
      }
    }

    return (
      <View style={{flex: 1}}>
        <View style={{flex: ratio, alignItems: 'center', justifyContent: 'center'}}>
          <RNCamera
            captureAudio={false}
            style={{width: size, height: size, marginTop: topMargin}}
            onBarCodeRead={this._handleBarCodeRead}
          >
            {({ camera, status}) => {
              if (status !== 'READY') return <PendingView />;
              return (
                <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity onPress={() => this._handleBarCodeRead(camera)} style={styles.capture}>
                    <Text style={{ fontSize: 14 }}> SNAP </Text>
                  </TouchableOpacity>
                </View>
              );
            }}
          </RNCamera>
        </View>

        <View style={{flex: 1 - ratio, backgroundColor: 'transparent'}}>
          <View style={{
            marginBottom: 10, marginHorizontal: 10, height: 10,
            borderRadius: 5,
            flexDirection: 'row'}}>
            {
              this.state.done && this.state.done.map((done, key) => (
                <View key={key} style={[{flex: progressWidth, backgroundColor: done ? 'green': '#ccc'}, getBorderRadius(key, this.state.done.length)]}/>
              ))
            }
          </View>
          <Text style={{fontSize: 16, fontWeight: 'bold', alignSelf: 'center', justifyContent: 'space-between'}}>
            {this.state.line}
          </Text>

          <View style={styles.metadata}>
            {this.state.status === 1 &&
            <View>
              <View style={styles.metadataEntry}>
                <Text style={styles.metadataTitle}> Content Type: </Text>
                <Text style={styles.metadataContent}> {this.state.metadata.type} </Text>
              </View>

              {
                this.state.metadata.type === 'FILE' &&
                <View style={styles.metadataEntry}>
                  <Text style={styles.metadataTitle}> File Name: </Text>
                  <Text style={styles.metadataContent}> {this.state.metadata.name} </Text>
                </View>
              }

              <View style={styles.metadataEntry}>
                <Text style={styles.metadataTitle}> Content Size: </Text>
                <Text style={styles.metadataContent}> {this.state.metadata.size} </Text>
              </View>

              <View style={styles.metadataEntry}>
                <Text style={styles.metadataTitle}> QRCode Count: </Text>
                <Text style={styles.metadataContent}> {this.state.metadata.count} </Text>
              </View>

              <View style={styles.metadataEntry}>
                <Text style={styles.metadataTitle}> MD5: </Text>
                <Text style={[styles.metadataContent, {fontSize: 12}]}> {this.state.metadata.md5sum} </Text>
              </View>
            </View>
            }
          </View>
          <View style={{flex: 0.6, flexDirection: 'row', alignSelf: 'center'}}>
            <Button icon={{name: 'close', type: 'font-awesome', color: 'white'}}
                    title={'Cancel'}
                    buttonStyle={{backgroundColor: 'red'}}
                    onPress={() => {this.onGoHome()}}/>
          </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  bottomBar: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },

  metadata: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 30
  },
  metadataEntry: {
    flexDirection: 'row',
  },
  metadataTitle: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metadataContent: {
    fontSize: 18,
  }
});