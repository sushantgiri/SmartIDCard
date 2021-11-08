import React from 'react'
import { StyleSheet, View, Text, Linking, Image} from 'react-native'

import SecureStorage from 'react-native-secure-storage'

import CLoader from './common/Loader'; // Loader

var mainLogo = require('../screens/assets/images/png/person_icon.png')
var textLogo = require('../screens/assets/images/png/sidca_icon.png')


export default class LoadingScreen extends React.Component {

    constructor(props){
        super(props);
        this._bootstrapAsync();
    }

    _bootstrapAsync = async () => {
        const userToken = await SecureStorage.getItem('userToken');
        setTimeout(() => {
            this.props.navigation.navigate(userToken ? 'App' : 'Auth');
        }, 3000)
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
			<View style={common.wrap}>
				<View style={common.contents}>
                <View style={common.centerLogo}>
                     <Image source={mainLogo}></Image> 
                </View>

                <View style={common.bottomLogo}>
                     <Image source={textLogo}></Image> 
                </View>

					{/* <CLoader title={''} /> */}
				</View>
			</View>
		) 
    }
    componentDidMount(){
        //this.linktest();
    }
}

const common = StyleSheet.create({
    wrap : { flex:1, position:'relative', backgroundColor:'#FFFFFF' },
    header : { padding:20, paddingBottom:0, backgroundColor:'red' },
    contents : { flex:1, position:'relative', padding:20, },
    footer : { padding:0, },
    title : { fontSize:22, fontWeight:'bold' },
    textInput : {
        width:'100%', fontSize:20, marginBottom:8,
        paddingTop:15, paddingBottom:15, paddingLeft:12, paddingRight:12, 
        borderWidth:2, borderRadius:8, borderColor:'#CED2D4',
    },
    buttonView : { width:'100%', alignItems:'center', },
    button : { 
        width:'100%', alignItems:'center', color:'#FFFFFF',
        padding:30, backgroundColor:'#1ECB9C', 
        borderWidth:0, borderRadius:0,
    },
    buttonText : { color:'#FFFFFF', fontSize:22, fontWeight:'bold' },
    centerLogo: { justifyContent: 'center', alignItems: 'center', height: '100%' },
    bottomLogo: { justifyContent: 'center', alignItems: 'center',  margin: -20 },
});