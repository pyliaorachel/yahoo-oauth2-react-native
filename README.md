# Yahoo OAuth2 in React Native
Sample tutorial of [Yahoo OAuth2 API](https://developer.yahoo.com/oauth2/guide/flows_authcode/) in React Native. We will create an app and link to OAuth2 of Yahoo for retrieving user profiles.

Focusing on IOS.

Switch to [tutorial](https://github.com/pyliaorachel/yahoo-oauth2-react-native/tree/tutorial) branch to follow the instructions below. [master](https://github.com/pyliaorachel/yahoo-oauth2-react-native/tree/master) branch is not for tutorial use.

Thanks to [this article](https://medium.com/@jtremback/oauth-2-with-react-native-c3c7c64cbb6d#.xkj1mceyo) for great instructions on using Dropbox API. Many of the project are based on this article.

Different APIs have different limitations, so it would be harmful if you follow the guide above to try to create a Yahoo app. Follow this one if you want to save your time.

## Usage
Goto [Yahoo Developer Network (YDN)](https://developer.yahoo.com) and create an app.

Add a `config.js` file to the root of directory, which contains:

```javascript
export default {
  client_id: 'YOUR_CLIENT_ID',
  client_secret: 'YOUR_CLIENT_SECRET'
}
```

Then run

```
npm install
react-native run-ios
```
