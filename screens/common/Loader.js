import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { DotsLoader } from 'react-native-indicator'
import PropTypes from 'prop-types'

export default class CLoader extends React.Component {
    static propTypes = {
        title: PropTypes.string
        //PropTypes.style
        //PropTypes.bool
        //PropTypes.func
    }

    render() {
        return (
            <View style={loader.contents}>
                <Text style={loader.title}>{this.props.title}</Text>
                <DotsLoader 
                size={15}
                color={'#4bd5b0'}
                betweenSpace={15}
                >
                </DotsLoader>
            </View>
        );
    }
}

const loader = StyleSheet.create({
    contents : { width:'100%', height:'100%', alignItems:'center', justifyContent:'center', },
    title : { fontSize:20, paddingBottom:20, fontWeight:'bold', }
});