import React from 'react'
import { StyleSheet, View, Button,Text, TextInput, AsyncStorage } from 'react-native'


export default class CompleteSubmit extends React.Component {
  

  goToMain = () => {

    this.props.navigation.navigate('VCcontrol')
  
  }

  render() {
    
    

    return (
      <View style={styles.container}>
      <Text style={styles.textMarginer}>
          성공
      </Text>
        <Button title='Go to Main' onPress={this.goToMain} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textMarginer: {
    margin:20
  },
})
