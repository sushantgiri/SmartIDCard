import React from 'react'
import { StyleSheet, View, Text} from 'react-native'

import SecureStorage from 'react-native-secure-storage'

export default class LoadingScreen extends React.Component {

    constructor(props){
        super(props);
        this._bootstrapAsync();
    }

    _bootstrapAsync = async () => {
        const userToken = await SecureStorage.getItem('userToken');
        console.log(userToken)
        this.props.navigation.navigate(userToken ? 'App' : 'Auth');
    }



    render() {
        return (
          <View style={styles.container}>
            <View>
                <Text>로딩중</Text>
            </View>
          </View>
        )   
    }
}

const styles = StyleSheet.create({
  
})
