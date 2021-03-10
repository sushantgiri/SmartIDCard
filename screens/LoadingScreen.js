import React from 'react'
import { StyleSheet, View, Text, Linking} from 'react-native'

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
    //확인용
    linktest = () => {
        Linking.getInitialURL().then(url =>{
            console.log(url);
            alert(url)
        });
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
    componentDidMount(){
        //this.linktest();
    }
}

const styles = StyleSheet.create({
  
})
