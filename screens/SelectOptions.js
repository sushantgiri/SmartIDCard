import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';

export default class SelectOptions extends React.Component {


    state = {
        dummyView: false
    }

    render(){
        return(
            <View>

                <View style={optionsStyle.headerContainer}>

                    <Text style={optionsStyle.headerLabel}>사용처 선택</Text>
                    <TouchableOpacity  onPress={() => this.props.navigation.pop()}>

                    <Image source={require('../screens/assets/images/png/close_scanner.png')} />
                    </TouchableOpacity>
                    
                </View>

                <View style={optionsStyle.barContainer}>
                    <Text style={optionsStyle.barLabel}>사용처를 선택해주세요 ✨</Text>
                </View>

                <TouchableOpacity  onPress={() => {
                     this.props.navigation.pop();
                    this.props.navigation.push('ScanScreen');
 
                    }}>
                <View style={optionsStyle.optionsContainer}>
                    <Image source={require('../screens/assets/images/png/primary.png')} />
                    <Text style={optionsStyle.optionLabelStyle}>주변에 비콘이 없을 땐{"\n"}QR로 스캔하세요</Text>
                </View>
                </TouchableOpacity>
            </View>    
        )
    }
}

const optionsStyle = StyleSheet.create({

    rootContainer: {
        flex : 1,
        
    },

    headerContainer: {
      marginTop:50,
      marginBottom: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginStart: 24,
      marginEnd: 24,
      
    },

    barContainer: {
        flexDirection: 'row',
        marginStart: 24,
        marginEnd: 24,
        borderRadius: 8,
        backgroundColor: '#42528B',
        paddingStart: 16,
        paddingEnd: 16,
        paddingTop: 12,
        paddingBottom: 12,
        justifyContent:'space-between',
        alignItems:'center',
        marginBottom: 33,
    },

    barLabel:{
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600'
    },

    optionsContainer: {
        marginStart: 24,
        marginEnd: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5EBED',
        flexDirection: 'row',
        padding: 15,
        marginBottom: 16,
    },

    optionLabelStyle: {
        marginStart: 22,
        fontSize: 16,
        color:'rgba(26, 36, 51, 0.9)'
    },

    secondaryLabelStyle: {
        fontSize: 16,
        color: 'rgba(26, 36, 51, 0.9)',
        fontWeight: '500'
    },


    headerLabel: {
        color: '#1A2433',
        fontSize: 16,
        fontWeight: '600',
        justifyContent: 'center',
        flex: 1,
        textAlign: 'center'
    },
    headerImageStyle: {
        
    }
})