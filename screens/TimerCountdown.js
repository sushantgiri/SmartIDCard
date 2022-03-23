import React from 'react'
import {View, Text} from 'react-native'
import PropTypes from 'prop-types';

export default class TimerCountdown extends React.Component{

    constructor(props) {
        super(props);
        this.state = { timer: 60}
    }

    componentDidMount(){
        this.startTimer()
      }

      startTimer(){
        this.interval = setInterval(
            () => this.setState((prevState)=> ({ timer: prevState.timer - 1 })),
            1000
          );
      }
      
      componentDidUpdate(){
        if(this.state.timer === 0){ 
            clearInterval(this.interval);
            this.props.onCountDownFinished()
            this.setState({timer: 60});
            this.startTimer() 
        }
      }
      
      componentWillUnmount(){
       clearInterval(this.interval);
      }
      
      render() {
        return (
          <View style={{marginBottom: 10, marginTop:10}}>
            <Text> {this.state.timer} </Text>
          </View> 
        )
      }
}

TimerCountdown: protoTypes = {
    onCountDownFinished: PropTypes.func.isRequired
}