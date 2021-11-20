import React from 'react'
import {StyleSheet, Text, Image, View, TouchableOpacity,Modal,TextInput, TouchableHighlight} from 'react-native'
import CheckPassword from './CheckPassword';

var closeIcon = require('../screens/assets/images/png/close_scanner.png');
var cardIcon = require('../screens/assets/images/png/secondary.png')


export default class CertificateSelectAndSubmit extends React.Component {

    state = {
        cards: [{
            cardIcon: 'secondary.png',
            cardLabel: '본인 인증서'
        }],
        password: '',
        dataKey: '',
        address: '',
        privateKey:'',
        mnemonic:'',
        VCarray:[],
        VCjwtArray:[],
      
    }

   


    renderItemDetail = (entry) => {
        return(
            <View style={certificateStyles.itemContainer}>

            <Image source={cardIcon} />

            <Text style={certificateStyles.cardLabelStyle}>본인 인증서</Text>

            </View>   
        )
    }

    render(){

        return(


            <View style={certificateStyles.rootContainer}>

        
                    <TouchableOpacity  onPress={() => {
                     this.props.navigation.pop(); 
                    }}>
                    <View style={certificateStyles.closeContainer}>
                        <Image source={closeIcon} />
                    </View>
                    </TouchableOpacity>

                    <Text style={certificateStyles.headerStyle}>검증된 서비스 제공자의 정보입니다.</Text>

                    <View style={certificateStyles.listWrapper}>
                    {this.state.cards.map((entry, index)=>{
							return(
								this.renderItemDetail(entry)
							)
					})}
                    </View>

                <TouchableOpacity onPress={() => {

                    }}>


                 <View style={certificateStyles.buttonContainer}>
                    <Text style={certificateStyles.buttonLabelStyle}>제출</Text>
                  </View>

                </TouchableOpacity>

                <CheckPassword />

                

            </View>

        

            

        )
    }
}



const certificateStyles = StyleSheet.create({

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

    itemContainer: {
        borderRadius:8,
        borderWidth:1,
        borderColor: '#E5EBED',
        paddingTop: 15,
        paddingBottom: 15,
        paddingStart:20,
        paddingEnd: 20,
        flexDirection: 'row',
        marginStart: 21,
        marginEnd: 21,
        alignItems: 'center',
        marginBottom: 21,
    },

    cardLabelStyle: {
        color: 'rgba(26, 36, 51, 0.9)',
        fontSize: 16,
        fontWeight: '500',
        marginStart: 35,

    },
    listWrapper: {
        flex: 1,
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
    },

    cardItem : { 
		width:'80%', height:400, backgroundColor:'#1ECB9C',
    	borderRadius:12, position:'relative', marginLeft:'10%', marginRight:'10%',
		paddingTop:20, paddingBottom:20, paddingLeft:30, paddingRight:30,
	},

})