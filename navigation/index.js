import { createStackNavigator } from 'react-navigation-stack'
import {createAppContainer} from 'react-navigation'
import React from 'react';
import VCcontrol from '../screens/Home'
import CompleteSubmit from '../screens/CompleteSubmit'
import Home from '../screens/Home'
import QRInfoScreen from '../screens/QRInfoScreen'
import QRscreenVP from '../screens/QRscreenVP'
import ScanScreen from '../screens/ScanScreen'
import VCselect from '../screens/VCselect'
import VCverify from '../screens/VCverify'
import Main from '../screens/Main'
import Signup from '../screens/Signup'
import Recovery from '../screens/Recovery'
import WebRequest from '../screens/WebRequest';
const AppNavigator = createStackNavigator(
  {
    VCcontrol: { screen: VCcontrol},
    ScanScreen: { screen: ScanScreen},
    VCverify: { screen: VCverify},
    QRInfoScreen: { screen: QRInfoScreen},
    QRscreenVP: {screen: QRscreenVP},
    CompleteSubmit: { screen: CompleteSubmit},
    VCselect: {screen: VCselect},
    Main: { screen: Main,
            navigationOptions: {
              headerTitle: 'Main'
            },
          path: 'Main' },
    Signup: { screen: Signup },
    Recovery: { screen: Recovery},
    ScanScreen: { screen: ScanScreen},
    WebRequest: {screen: WebRequest,
                  navigationOptions: {
                    headerTitle: 'WebRequest'
                  },
                path: 'WebRequest'}
  },
  {
    initialRouteName: 'Main',
    headerMode: 'none'
  }
)

const AppContainer = createAppContainer(AppNavigator)

export default () => {
  const prefix = 'smartidcard://'
  return <AppContainer uriPrefix={prefix} />
}
