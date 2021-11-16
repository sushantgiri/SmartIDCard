import React from 'react';
import {StyleSheet, View, Text, Image, ScrollView, TouchableOpacity} from 'react-native';
import { VPEntries } from './static/vpEntries';


export default class VPInfo extends React.Component {


    renderItemDetail = (entry) => {
        return(
            <View>
                    <Text style={itemStyle.title}>{entry.date}</Text>

                    <View style={itemStyle.dataContainer}>

                        <Text style={itemStyle.containerLabel}>{entry.details.title}</Text>

                        <View style={itemStyle.rowContainer}>

                            <Text style={itemStyle.listLabelStyle}>방문일</Text>
                            <Text style={itemStyle.listDataItemStyle}>2021-07-27 12:01</Text>

                        </View>

                        <View style={itemStyle.rowContainer}>

                            <Text style={itemStyle.listLabelStyle}>방문일</Text>
                            <Text style={itemStyle.listDataItemStyle}>2021-07-27</Text>

</View>

                    </View>
            </View>
        )
    }


    render(){
        return(
                <View style={vpStyle.container}>
                    <TouchableOpacity onPress={() => this.props.navigation.pop()}>
                        <Image style={vpStyle.backButton} source={require('../screens/assets/images/png/back_icon.png')} />
                    </TouchableOpacity>
                    <Text style={vpStyle.titleLabel}>정보 제공 내역</Text>

                    <View style={vpStyle.rowContainer}>


                        <View style={vpStyle.weekStyle}>
                            <Text style={vpStyle.weekLabel}>1주일</Text>
                        </View>

                        <View style={vpStyle.monthStyle}>
                            <Text style={vpStyle.monthLabel}>1개월</Text>
                        </View>

                        <View style={vpStyle.infoContainer}>

                            <Text style={vpStyle.infoLabel}>상세 조회</Text>
                            <Image source={require('../screens/assets/images/png/arrow_down.png')} />

                        </View>

                    </View>


                    <View style={vpStyle.line} />
                    <ScrollView style={itemStyle.scrollStyle} >
                    {VPEntries.map((entry, index)=>{
							return(
								this.renderItemDetail(entry)
							)
					})}

                    </ScrollView>


                </View>
        )
    }
}

const itemStyle = StyleSheet.create({

    title: {
        color: '#1A2433',
        marginStart:18,
        fontSize: 18,
        fontWeight:'600',
        marginTop: 24,
    },

    dataContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5EBED',
        marginStart: 18,
        marginTop: 16,
        paddingStart: 20,
        marginEnd: 20,
        paddingTop: 16,
        paddingBottom: 16,
    },

    containerLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(26, 36, 51, 0.9)',
        marginBottom: 12,
    },
    
    rowContainer: {
        flexDirection: 'row',
        paddingBottom: 8,
    },

    listLabelStyle: {
        paddingEnd: 24,
        color: 'rgba(18, 18, 29, 0.6)',
        fontSize: 14,

    },

    listDataItemStyle: {
        color: 'rgba(26, 36, 51, 0.9)',
        fontSize: 14,
    },

    scrollStyle: {
        marginBottom: 12,
    }
})


const vpStyle= StyleSheet.create({

    container:{
        backgroundColor: '#ffffff',
        flex: 1,
        flexDirection: 'column',

    },

    backButton: {
        marginTop: 38,
        marginStart: 24,
        marginBottom: 22,
    },

    titleLabel: {
        color: '#44424A',
        marginStart: 24,
        marginBottom: 24,
        fontSize: 24,
        fontWeight: '600',
    },

    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',

    },

    infoContainer: {
        flex :1,
        flexDirection: 'row',
        alignItems: 'center' ,
        justifyContent: 'flex-end',
        marginEnd: 24,
    },

    weekStyle: {
        borderRadius: 8,
        backgroundColor: '#EEFCF8',
        borderWidth: 1,
        borderColor: '#1ECB9C',
        paddingStart: 16,
        paddingEnd: 16,
        paddingTop: 8,
        paddingBottom: 8,
        marginStart: 24,
        marginEnd: 8
    },

    weekLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#109D77',
    },

    monthStyle: {
        borderRadius: 8,
        backgroundColor: '#E6EBF3',
        paddingStart: 16,
        paddingEnd: 16,
        paddingTop:8,
        paddingBottom: 8,

    },

    monthLabel: {
        color: '#1A2433',
        fontSize: 14,
        fontWeight: '500'
    },

    infoLabel: {
        fontWeight: '500',
        color: 'rgba(26, 36, 51, 0.9)',
        fontSize: 14,
        marginEnd: 8,

    },
    line: {
        marginTop: 24,
        borderColor: '#EAEDF0',
        borderWidth:1,        
    }
})