import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity, ScrollView} from 'react-native';

var closeIcon = require('../screens/assets/images/png/close_scanner.png');


export default class VerifiedServiceProviders extends React.Component {

    state = {
        isVerified: false,
    }


    render(){
        return(
            <ScrollView>
                <View  style={providersStyle.rootContainer}>
                    <View style={providersStyle.closeContainer}>
                        <Image source={closeIcon} />
                    </View>

                    <Text style={providersStyle.headerStyle}>검증된 서비스 제공자의 정보입니다.</Text>

                    <View style={providersStyle.statusContainer}>

                        <Text style={providersStyle.statusLabel}>검증여부 확인</Text>
                        <View style={providersStyle.loadingContainer}>
                            <Text style={providersStyle.loadingLabelStyle}>{!this.stateisVerified ? '진행중...' : '검증완료'} </Text>
                        </View>
                    </View>

                    <View style={providersStyle.detailContainer}>

                        <Text style={providersStyle.labelStyle}>도메인명</Text>
                        <Text style={providersStyle.valueStyle} >http://www.naver.com</Text>

                        <Text style={providersStyle.labelStyle}>사업자명</Text>
                        <Text style={providersStyle.valueStyle}>이스톰</Text>

                        <Text style={providersStyle.labelStyle}>대표자명</Text>
                        <Text style={providersStyle.valueStyle}>최유선</Text>

                        <Text style={providersStyle.labelStyle}>사업자주소</Text>
                        <Text style={providersStyle.valueStyle}>경기도 안양시 동안구...</Text>

                        <Text style={providersStyle.labelStyle}>사업자전화번호</Text>
                        <Text style={providersStyle.valueStyle}>010 1114 1111</Text>


                    </View>
                        <TouchableOpacity onPress={() => {

                        }}>


                            <View style={providersStyle.buttonContainer}>
                                <Text style={providersStyle.buttonLabelStyle}>다음</Text>
                            </View>



                        </TouchableOpacity>
                    <View>


                    </View>

                </View>
            </ScrollView>
        )
    }
}

const providersStyle = StyleSheet.create({

    rootContainer: {
        backgroundColor: '#ffffff',
        flex: 1,
    },

    closeContainer: {
        flexDirection:'row',
        marginTop: 20,
        padding: 20,
        marginBottom: 20,
        justifyContent: 'flex-end',

    },

    headerStyle:{
        color: '#1A2433',
        fontSize: 18,
        marginStart: 24,
        marginBottom: 22,

    },

    statusContainer: {
        borderRadius: 8,
        backgroundColor:'#EFF8FF',
        marginStart: 24,
        marginEnd: 24,
        padding: 22,
        flexDirection: 'row',
         alignItems:'center',
         justifyContent:'space-between'
    },

    statusLabel: {
        color: '#44424A',
        fontWeight: '600',
        fontSize: 16,
    },

    loadingContainer: {
        borderRadius: 20,
        backgroundColor: '#C8E7FF',
    },

    loadingLabelStyle: {
        color: '#0083FF',
        fontSize: 16,
        fontWeight: '600',
        paddingStart: 20,
        paddingEnd: 20,
        paddingTop: 12,
        paddingBottom: 12,
    },

    detailContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5EBED',
        marginStart: 27,
        marginEnd: 27,
        padding: 30,
        marginTop: 21,

    },

    labelStyle: {
        color: 'rgba(26, 36, 51, 0.9)',
        fontWeight: '600',
        fontSize:16,
        marginBottom: 8,

    },

    valueStyle: {
        color: 'rgba(153, 153, 153, 0.9)',
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 26,
    },

    buttonContainer: {
        backgroundColor: '#1ECB9C',
        borderRadius: 8,
        paddingTop: 15,
        paddingBottom:15,
        paddingStart: 32,
        paddingEnd:32,
        marginBottom: 20,
        marginStart: 24,
        marginEnd: 24,
        marginTop: 24,
    },

    buttonLabelStyle: {
        color: '#FFFFFF',
        fontWeight:'600',
        fontSize: 18,
        alignSelf: 'center'
    }

   

})