import { createStackNavigator } from 'react-navigation-stack'
import Main from '../screens/Main'
import Signup from '../screens/Signup'
import Recovery from '../screens/Recovery'

import ScanScreen from '../screens/ScanScreen'
const AuthNavigation = createStackNavigator(
  {
    Main: { screen: Main },
    Signup: { screen: Signup },
    Recovery: { screen: Recovery},
    ScanScreen: { screen: ScanScreen}
  },
  {
    initialRouteName: 'Main',
    headerMode: 'none'
  }
)

export default AuthNavigation
