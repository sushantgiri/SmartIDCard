import { createStackNavigator } from 'react-navigation-stack'
import Login from '../screens/Login'
import Signup from '../screens/Signup'
import Recovery from '../screens/Recovery'

const AuthNavigation = createStackNavigator(
  {
    Login: { screen: Login,
            navigationOptions: {
              headerTitle: 'Login'
            },
            path: 'Login' },
    Signup: { screen: Signup },
    Recovery: { screen: Recovery}
  },
  {
    initialRouteName: 'Login',
    headerMode: 'none'
  }
)

export default AuthNavigation
