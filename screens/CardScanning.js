import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Dimensions, Image} from 'react-native'


var headerIcon = require('../screens/assets/images/png/card_icon.png')

export default class CardScanning extends React.Component {

    render(){
        return (
            <View style={cardScanningStyles.rootContainer}>
                
            <View >

                <View style={cardScanningStyles.childContainer}>

                    <View style={cardScanningStyles.subChildContainer}>

                        <Image style={cardScanningStyles.iconStyle} source={headerIcon}  />

                        <View style={cardScanningStyles.dummyView} />

                        <Text style={cardScanningStyles.labelStyle}>제주 대학교</Text>

                    </View>

                </View>

            </View>

            <Text style={cardScanningStyles.loaderLabelStyle}>인증서를 스캔중입니다...</Text>

            </View>
        )
    }
}

const cardScanningStyles = StyleSheet.create({

    rootContainer : {
        backgroundColor: '#ffffff',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'

    },

    childContainer: {
        borderRadius:4,
        borderWidth: 2,
        borderColor: '#2BECB8',
        width: Dimensions.get('window').width - 80,
        height: 428,
        alignSelf: 'center' 
    },

    subChildContainer: {
        width: Dimensions.get('window').width - 112,
        borderRadius:4,
        backgroundColor: 'linear-gradient(180deg, rgba(30, 203, 156, 0.6) 0%, rgba(30, 203, 156, 0) 100%);',
        height: 394,
        alignSelf: 'center',
        marginTop: 18,
    },

    iconStyle: {
        marginTop: 20,
        marginStart: 18,
    },

    dummyView: {
        flex: 1,
        flexDirection: 'column'
    },

    labelStyle: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '600',
        marginStart: 20,
        marginBottom: 20,
        
    },

    loaderLabelStyle: {
        color: 'rgba(125, 132, 143, 0.7)',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 40,
        alignSelf: 'center'
    },

    lineStyle: {
        height: 2,
        color: '#30E5BD',
        width: Dimensions.get('window').width - 55
    }
})