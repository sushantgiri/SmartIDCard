import { createStackNavigator } from 'react-navigation-stack'
import Main from '../screens/Main'
import Signup from '../screens/Signup'
import Recovery from '../screens/Recovery'

const AuthNavigation = createStackNavigator(
  {
    Main: { screen: Main,
            navigationOptions: {
              headerTitle: 'Main'
            },
            path: 'Main' },
    Signup: { screen: Signup },
    Recovery: { screen: Recovery}
  },
  {
    initialRouteName: 'Main',
    headerMode: 'none'
  }
)

export default AuthNavigation
