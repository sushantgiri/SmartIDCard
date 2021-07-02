import React from 'react'
import { StyleSheet, View, Text, Image, Button, TouchableOpacity} from 'react-native'

var imageLogo = require('../screens/assets/images/png/logo.png')
var imageContents = require('../screens/assets/images/png/main.png')

export default class Intro extends React.Component {
    goToSignup = () => this.props.navigation.navigate('Signup')

    render() {
        return (
            <View style={common.wrap}>
                <View style={intro.header}>
                    <View style={intro.logo}>
                        <Image source={imageLogo}></Image>  
                    </View>
                </View>
                <View style={intro.contents}>
                    <View style={intro.image}>
                        <Image source={imageContents}></Image>
                    </View>
                    <View style={intro.buttonView}>
                        <TouchableOpacity style={intro.button} activeOpacity={0.8} title='START' onPress={this.goToSignup}>
                            <Text style={intro.buttonText}>START</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={intro.footer}></View>
            </View>
        )
    }
}

const common = StyleSheet.create({
    wrap : { flex:1, position:'relative', backgroundColor:'#FFFFFF' },
    header : { padding:20, paddingBottom:0, },
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
    buttonText : { color:'#FFFFFF', fontSize:22, fontWeight:'bold' }
});

const intro = StyleSheet.create({
    header : { flex:0, },
    contents : { flex:1, position:'relative', },
    footer : { flex:0, },
    logo: { position:'absolute', width:'100%', alignItems:'center', top:120, },
    image: { position:'absolute', width:'100%', bottom:0, },
    buttonView : { position:'absolute', width:'100%', alignItems:'center', bottom:20, },
    button : { 
        alignItems:'center', bottom:30, color:'#FFFFFF', 
        borderRadius:12, backgroundColor:'#41528B',
        paddingTop:30, paddingBottom:30, paddingLeft:50, paddingRight:50,
    },
    buttonText : { color:'#ffffff', fontSize:24, fontWeight:'800', }
});

