import React from 'react';
import {Text, View, StyleSheet, Dimensions, Image} from 'react-native';

var universityIcon = require('../screens/assets/images/png/image_university.png')


export default class AnimatedLoading extends React.Component {

    render(){
        return(
            <View style={styles.rootContainer}>
                <View style={styles.outerRectangle}>
                    <View style={styles.cardContainer}>

                        <Image source={universityIcon} style={styles.universityIconStyle} />

                        <Text style={styles.universityLabelStyle}>제주 대학교</Text>

                    </View>


                </View>
                <Text style={styles.messageStyle}>인증서를 스캔중입니다...</Text>

            </View>
        )
    }
}

const styles = StyleSheet.create({

    rootContainer: {
        backgroundColor: '#ffffff',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    outerRectangle: {
        width: Dimensions.get('window').width - 80,
        height: Dimensions.get('window').height / 2,
        borderWidth: 1,
        borderRadius: 4,
        alignSelf: 'center',
        borderColor: '#2BECB8',

    },

    lineStyle: {
        backgroundColor: '#30E5BD',
        height: 2,
        width: '100%',
        position: 'absolute'

    },

    cardContainer: {
        backgroundColor: '#2BECB8', 
        borderRadius: 4,
        margin: 18,
        flex: 1,
        justifyContent: 'space-between'
    },

    universityIconStyle: {
        marginTop: 18,
        marginStart: 20,
    },

    universityLabelStyle: {
        marginStart: 20,
        marginBottom: 20,
        color: '#FFFFFF',
        fontWeight: '600',
    },

    messageStyle: {
        color:  'rgba(125, 132, 143, 0.7)',
        fontSize: 20,
        fontWeight: '600',
        marginTop: 40,
        alignSelf: 'center'

    }
})
