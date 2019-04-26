import React from "react";
import { Text, TextInput, StyleSheet, View, Share, Alert } from 'react-native';
import { Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

// let RNFS = require('react-native-fs');

export default class QRStreamResult extends React.Component {

  constructor(props) {
    super(props);
    this.onGoHome = props.onGoHome;
    this.onNewCapture = props.onNewCapture;

    this.metadata = props.metadata;
    this.content = props.content;

    // if (this.metadata.type === 'FILE') {
    //   var path = RNFS.DocumentDirectoryPath + this.metadata.name;
    //   RNFS.writeFile(path, content, 'utf8')
    //     .then((success) => {
    //       console.log('FILE WRITTEN!');
    //     })
    //     .catch((err) => {
    //       console.log(err.message);
    //     });
    // }
  }

  onShareContent = async () => {
    console.log(this.metadata);
    if (this.metadata) {
      try {
        const result = await Share.share({
          message: this.content,
          title: this.metadata.name
        });

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            Alert.alert(result.activityType);
          } else {
            Alert.alert("Successfully shared!")
          }
        } else if (result.action === Share.dismissedAction) {
          // dismissed
        }
      } catch (error) {
        alert(error.message);
      }
    } else {
      Alert.alert("No content to share, capture the content first!");
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.notification}>
          <Icon name="check-circle" size={100} color="green"/>
          {/*<Ionicons name="md-checkmark-circle" size={100} color="green"/>*/}
          <Text style={styles.notificationText}>
            Transferred successfully!
          </Text>
        </View>

        <View style={styles.metadata}>
          <View style={{flex: 1}}>
            <View style={styles.metadataEntry}>
              <Text style={styles.metadataTitle}> Content Type: </Text>
              <Text style={styles.metadataContent}> {this.metadata.type} </Text>
            </View>

            {
              this.metadata.type === 'FILE' &&
              <View style={styles.metadataEntry}>
                <Text style={styles.metadataTitle}> File Name: </Text>
                <Text style={styles.metadataContent}> {this.metadata.name} </Text>
              </View>
            }

            <View style={styles.metadataEntry}>
              <Text style={styles.metadataTitle}> Content Size: </Text>
              <Text style={styles.metadataContent}> {this.metadata.size} </Text>
            </View>

            <View style={styles.metadataEntry}>
              <Text style={styles.metadataTitle}> QRCode Count: </Text>
              <Text style={styles.metadataContent}> {this.metadata.count} </Text>
            </View>

            <View style={styles.metadataEntry}>
              <Text style={styles.metadataTitle}> MD5: </Text>
              <Text style={[styles.metadataContent, {fontSize: 12}]}> {this.metadata.md5sum} </Text>
            </View>
            <View style={styles.metadataEntry}>
              <TextInput
                editable={false}
                multiline={true}
                numberOfLines={4}
                style={{height: 200}}
                value={this.content}/>
            </View>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <View style={{flex: 1, flexDirection: 'row', alignSelf: 'center', justifyContent: 'space-between'}}>
            <Button icon={{name: 'home', type: 'font-awesome', color: 'white'}} title={'Home'} buttonStyle={{marginRight: 10, backgroundColor: 'black'}} onPress={() => {this.onGoHome()}}/>
            <Button icon={{name: 'camera', type: 'font-awesome', color: 'white'}} title={'New'} buttonStyle={{marginLeft: 10, backgroundColor: 'black'}} onPress={() => {this.onNewCapture()}}/>
            <Button icon={{name: 'share', type: 'font-awesome', color: 'white'}} title={'Share'} buttonStyle={{marginLeft: 20, backgroundColor: 'black'}} onPress={this.onShareContent}/>
          </View>
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

  notification: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 20,
    fontWeight: 'bold',
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
  },

  bottomBar: {
    flex: 0.1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});