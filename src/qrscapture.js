import React from 'react';
import {Text, StyleSheet, Platform, View, Dimensions, Alert} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {Button} from 'react-native-elements';

import Decoder from 'qrstream-decoder';

var {width, height} = Dimensions.get('window');

class PendingView extends React.Component {
  render () {
    const errorMessage = Platform.select({
      ios: "Please authorize to use camera in \n Settings -> Privacy -> Camera -> QRStream",
      android: "Please authorize to use camera!"
    })
    return (
      <View style={{flex: 1, paddingTop: '30%', backgroundColor: 'lightgreen', alignItems: 'center'}}>
        <Text>{errorMessage}</Text>
      </View>
    )
  }
}

class SquareConner extends React.Component {
  render() {
    let squareSize = this.props.size;
    let offset = 4;
    let cornerSize = 20;
    let lineWidth = 2;
    let lineColor = '#37b44a';
    return (
      <View
        style={{height: squareSize, width: squareSize}}>
        <View style={{position: 'absolute', left: offset, top: offset}}>
          <View style={{height: lineWidth, width: cornerSize + lineWidth, backgroundColor: lineColor}}/>
          <View style={{height: cornerSize, width: lineWidth, backgroundColor: lineColor}}/>
        </View>
        <View style={{position: 'absolute', right: offset, top: offset, transform: [{rotate: '90deg'}]}}>
          <View style={{height: lineWidth, width: cornerSize + lineWidth, backgroundColor: lineColor}}/>
          <View style={{height: cornerSize, width: lineWidth, backgroundColor: lineColor}}/>
        </View>
        <View style={{position: 'absolute', left: offset, bottom: offset, transform: [{rotateZ: '-90deg'}]
        }}>
          <View style={{height: lineWidth, width: cornerSize + lineWidth, backgroundColor: lineColor}}/>
          <View style={{height: cornerSize, width: lineWidth, backgroundColor: lineColor}}/>
        </View>
        <View style={{position: 'absolute', right: offset, bottom: offset, transform: [{rotateZ: '180deg'}]}}>
          <View style={{height: lineWidth, width: cornerSize + lineWidth, backgroundColor: lineColor}}/>
          <View style={{height: cornerSize, width: lineWidth, backgroundColor: lineColor}}/>
        </View>
      </View>
    )
  }
}

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
    let cameraWidth = width;

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
      <View style={styles.container}>
        <View style={{flex: 1, alignItems: 'center'}}>
          <View>
            <RNCamera captureAudio={false} style={{width, height}} onBarCodeRead={this._handleBarCodeRead}>
              {({ camera, status}) => {
                if (status !== 'READY') return <PendingView/>;
                // return (
                {/*<View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>*/}
                {/*<TouchableOpacity onPress={() => this._handleBarCodeRead(camera)} style={styles.capture}>*/}
                {/*<Text style={{ fontSize: 14 }}> SNAP </Text>*/}
                // </TouchableOpacity>
                // </View>
                // );
              }}
            </RNCamera>

            <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0}}>
              <View style={{height: 40, width: width, backgroundColor: 'white', opacity: 0.8}}/>
              <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={{height: cameraWidth, width: (width - cameraWidth) / 2, backgroundColor: 'white', opacity: 0.8}}/>
                <SquareConner size={cameraWidth}/>
                <View style={{height: cameraWidth, width: (width - cameraWidth) / 2, backgroundColor: 'white', opacity: 0.8}}/>
              </View>

              <View style={{flex: 1, backgroundColor: 'white', opacity: 0.9, alignItems: 'center'}}>
                <View style={{
                  marginTop: 10, marginHorizontal: 10, height: 10,
                  borderRadius: 5,
                  flexDirection: 'row'}}>
                  {
                    this.state.done && this.state.done.map((done, key) => (
                      <View key={key} style={[{flex: progressWidth, backgroundColor: done ? 'green': '#ccc'}, getBorderRadius(key, this.state.done.length)]}/>
                    ))
                  }
                </View>

                <Text style={{marginTop: 20, fontSize: 16, color: 'black',}}>{this.state.line}</Text>

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
                <Button icon={{name: 'close', type: 'font-awesome', color: 'white'}}
                        title={'Cancel'}
                        buttonStyle={{backgroundColor: 'red'}}
                        onPress={() => {this.onGoHome()}}/>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },

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