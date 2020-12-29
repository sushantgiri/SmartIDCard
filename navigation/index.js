import { createStackNavigator } from 'react-navigation-stack'
import {createAppContainer, createSwitchNavigator} from 'react-navigation'
import React from 'react';
import VCcontrol from '../screens/Home'
import CompleteSubmit from '../screens/CompleteSubmit'
import QRInfoScreen from '../screens/QRInfoScreen'
import QRscreenVP from '../screens/QRscreenVP'
import ScanScreen from '../screens/ScanScreen'
import VCselect from '../screens/VCselect'
import VCverify from '../screens/VCverify'
import Main from '../screens/Main'
import Signup from '../screens/Signup'
import Recovery from '../screens/Recovery'
import WebRequest from '../screens/WebRequest';
import LoadingScreen from '../screens/LoadingScreen';

import AppNavigation from './AppNavigation';
import AuthNavigation from './AuthNavigation';

const AppNavigator = createSwitchNavigator(
  {
    App: AppNavigation,
    Auth: AuthNavigation,
    LoadingScreen: { screen: LoadingScreen }
  },
  {
    initialRouteName: 'LoadingScreen',
    headerMode: 'none'
  }
)

const AppContainer = createAppContainer(AppNavigator)

export default () => {
  const prefix = 'smartidcard://'
  return <AppContainer uriPrefix={prefix} />
}
