# Yahoo OAuth2 in React Native
Sample tutorial of [Yahoo OAuth2 API](https://developer.yahoo.com/oauth2/guide/flows_authcode/) in React Native. We will create an app and link to OAuth2 of Yahoo for retrieving user profiles.

Focusing on IOS.

Switch to **tutorial** branch to follow the instructions below. **master** branch is not for tutorial use.

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

## Reproduction Procedure
1. [Create a React Native project](https://facebook.github.io/react-native/docs/getting-started.html#content).
2. Open `ios/your_project_name.xcodeproj` file to do the following configuration:

  1. Link the Linking library in the project
  
    - Click on your project. Go to `Build Settings > Search Paths > Header Search Paths` and add a path to the Linking library.
    - Here I choose to add `$(SRCROOT)/../node_modules/react-native/Libraries` and select `recursive`.
  
    <img src="https://scontent-tpe1-1.xx.fbcdn.net/t31.0-8/13765972_1223062894405141_2261938845379188073_o.jpg" 
alt="Add Path" width="681" height="447" border="50" />

  2. Open `AppDelegate.m` and add the following code after `@implementation AppDelegate`:
  
    ```
    - (BOOL)application:(UIApplication *)application
          openURL:(NSURL *)url
          sourceApplication:(NSString *)sourceApplication
          annotation:(id)annotation {
            return [RCTLinkingManager
                    application:application
                    openURL:url
                    sourceApplication:sourceApplication
                    annotation:annotation];
          }
    ```
    
    Also
    
    ```
    #import "RCTLinkingManager.h"
    ```
    
    - More information on [Linking](https://facebook.github.io/react-native/docs/linking.html).
    
  3. Register your app with a custom URL

    - Click on your project. Go to `Info > URL Types` and add a custom **Identifier** and **URL Scheme** for your app.
      + Creating a custom **URL scheme** makes your app directable through typing `yoururlscheme://` in the address bar of a browser.
      + **Identifier** makes different apps with the same URL scheme differentiable.
      
     <img src="https://scontent-tpe1-1.xx.fbcdn.net/t31.0-8/13767222_1223062354405195_7153781867942174900_o.jpg" 
alt="URL Scheme" width="602" height="195" border="50" />

3. Goto [Yahoo Developer Network](https://developer.yahoo.com) and create an app.

  - In the **Callback Domain** field, it has to be the domain of the server or app for redirection after authentication. 

4. Add a `config.js` file to the root of directory to store configuation information.
  
  ```javascript
  export default {
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET'
  }
  ```
4. Ready to write codes into `index.ios.js`.
  
  1. Remember to 
  
    ```javascript
    import {Linking} from 'react-native';
    import config from './config.js';
    ```

  2. Create a function for linking to OAuth site and retrieve the code:
  
    ```javascript
    function OAuth(client_id, cb) {
      // for secure authorization
      const state = Math.random() + '';
    
      // Listen to redirection
      Linking.addEventListener('url', handleUrl);
      function handleUrl(event){
        console.log(event.url);
        Linking.removeEventListener('url', handleUrl);
        const [, query_string] = event.url.match(/\?(.*)/);
        console.log(query_string);
    
        const query = qs.parse(query_string);
        console.log(`query: ${JSON.stringify(query)}`);
    
        if (query.state === state) {
          cb(query.code, getProfileData, 'access_token');
        } else {
          console.error('Error authorizing oauth redirection');
        }
      }
    
      // Call OAuth
      const oauthurl = 'https://api.login.yahoo.com/oauth2/request_auth?'+
                qs.stringify({
                  client_id,
                  response_type: 'code',
                  language: 'zh-tw',
                  redirect_uri: 'https://rn-webrtc-hall.herokuapp.com/api/oauth',
                  state,
                });
      console.log(oauthurl);
    
      Linking.openURL(oauthurl).catch(err => console.error('Error processing linking', err));
    }
    ```
    
    - The `handleUrl` function is for listening to callback from a server or Yahoo when OAuth is completed so that further processing may be conducted.
    - The implementation of `state` is for security reason. We will match the originally generated `state` with the one appended to the callback uri to see if the call is really redirected back upon our app's request.
    - Due to lack of documentation, some testing found out that `redirect_uri` **CANNOT** start with `yoururlscheme://` that can link you back to your app. Some other APIs such as Dropbox provides this convenience, but not Yahoo for now. Refer to the last part of this tutorial for more details.
    
  3. Create a function for getting the access\_token with the code retrieved:
  
    ```javascript
    function getToken(codeOrToken, cb, tokenType){
      let bodyJson;
      switch(tokenType){
        case 'access_token':
          console.log(`code: ${codeOrToken}`);
          bodyJson = {
            client_id: config.client_id,
            client_secret: config.client_secret,
            redirect_uri: 'oob',
            code: codeOrToken,
            grant_type: 'authorization_code',
          };
          break;
        case 'refresh_token':
          console.log(`refresh_token: ${codeOrToken}`);
          bodyJson = {
            client_id: config.client_id,
            client_secret: config.client_secret,
            redirect_uri: 'oob',
            refresh_token: codeOrToken,
            grant_type: 'refresh_token',
          };
          break;
        default:
          console.error('Unidentified token type');
      }
    
      const tokenurl = `https://api.login.yahoo.com/oauth2/get_token`;
      const authcode = base64.encode(`${config.client_id}:${config.client_secret}`);
      fetch(tokenurl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${authcode}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyJson)
      }).then(res => {
        return res.json();
      }).then(token => {
        console.log(`token res: ${JSON.stringify(token)}`);
        cb(token);
      }).catch(err => console.error('Error fetching token', err));
    }
    ```
    
    - At the later stage of this project, we will use the refresh\_token retrieved for requesting access\_token so that we don't need to request for the code every time. But at this stage, you can just implement the part to get access\_token from the code retrieved.
    - Read the [official document](https://developer.yahoo.com/oauth2/guide/flows_authcode/) to know what's going on with `authcode`.
    
  4. Create a function for calling the API to get user profile:
    
    ```javascript
    function getProfileData(tokenData){
      const dataurl = `https://social.yahooapis.com/v1/user/${tokenData.xoauth_yahoo_guid}/profile?format=json`;
      fetch(dataurl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      }).then(res => {
        return res.json();
      }).then(profile => {
        console.log(`User profile: ${JSON.stringify(profile)}`);
      }).catch(err => console.error('Error fetching profile data', err));
    }
    ```
  
  5. Finally, call `OAuth` in `componentDidMount `:
  
    ```javascript
    componentDidMount() {
      OAuth(config.client_id, getToken);
    }
    ```
    
  6. Not yet ready. Remember to implement some codes in the server side to let it return the imformation retrieved from Step 2. 

    - Here we go to [Heroku](https://www.heroku.com) to implement our server-side code. The main point is to redirect the `code` and `state` to our app.
    - The server will be called via the `redirect_uri` we set when calling the OAuth2 API. `code` and `state` will be appended to the uri, which looks like `https://yourappname.herokuapp.com/api/oauth?code=codecodecode&state=randomnumber12345`. Note that `herokuapp.com` is the Callback Domain we filled out when creating the app in YDN.
    - Redirect to `yoururlscheme://path` in the server with the information appended like this: `yoururlscheme://path?code=codecodecode&state=randomnumber12345`
    - We will skip the implementation detail for now. Inquiries upon facing difficulties are welcome.
    
  7. Refer to the log and the user profile should show up!


## Notes

- If you read the article provided at the beginning, you may find the technique different in redirection. This is because Dropbox provides flexibility in `redirect_uri` and a custom URL scheme can be implemented to redirect back to the app, which saves efforts implementing the server side part. Yahoo doesn't provide this flexibility by now, and it only accepts uris starting with `http://` or `https://`, as we guess after testing. So the redirection to `yoururlscheme://` should be in the server side.

<img src="https://scontent-tpe1-1.xx.fbcdn.net/t31.0-8/13719608_1223062254405205_5278625681264186608_o.jpg" 
alt="Error" width="375" height="589" border="50" />
