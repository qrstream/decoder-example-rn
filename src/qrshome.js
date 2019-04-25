import React from "react";

import {StyleSheet, View, Image, Dimensions} from 'react-native';
import {Button} from "react-native-elements";

export default class QRStreamHome extends React.Component {
  constructor(props) {
    super(props);

    this.onNewCapture = props.onNewCapture;
  }
  render() {
    var {height, width} = Dimensions.get('window');
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <Image
            style={{
              width: width * 0.6,
              resizeMode: 'contain'}}
            source={require('../assets/images/qrstream.png')}
          />
        </View>
        <View>
          <Button icon={{name: 'camera', type: 'font-awesome', color: 'white'}}
                  title={'Start Capture'}
                  buttonStyle={{backgroundColor: 'black', marginLeft: 60, marginRight: 60}}
                  onPress={() => {this.onNewCapture()}}/>
        </View>
      </View>
    )
  }
}

let topMargin = 40;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    marginTop: topMargin
  },
  banner: {
    flex: 0.618,
    alignItems: 'center',
    justifyContent: 'center',
  }
});