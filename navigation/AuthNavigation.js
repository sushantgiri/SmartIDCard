import { createStackNavigator } from 'react-navigation-stack'
import Intro from '../screens/Intro'
import Login from '../screens/Login'
import Signup from '../screens/Signup'
import Recovery from '../screens/Recovery'

const AuthNavigation = createStackNavigator(
	{
		Intro: { screen: Intro },
		Login: { 
			screen: Login,
			navigationOptions: { 
				headerTitle: 'Login'
			},
			path: 'Login' 
		},
		Signup: { screen: Signup },
		Recovery: { screen: Recovery}
	},

	{
		initialRouteName: 'Intro',
		headerMode: 'none'
	}
)

export default AuthNavigation
