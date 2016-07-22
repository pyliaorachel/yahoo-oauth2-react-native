/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Linking
} from 'react-native';
import config from './config.js';
import qs from 'qs';
import base64 from 'base-64';

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

    //if (query.state === state) {
    if (state === state) {
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

class AuctionLiveStreamingLogin extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    console.log('in componentDidMount');
    OAuth(config.client_id, getToken);
    //getToken('ACuBkVcgKAUi7wUCPWJClaJgw4x9DrayJZzF9Qwl5YrBdP9CCeE-', getProfileData, 'refresh_token');
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to Yahoo Auction Live Streaming Platform!
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('AuctionLiveStreamingLogin', () => AuctionLiveStreamingLogin);
