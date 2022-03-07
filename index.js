
'use strict';
const http = require('http');
const requestData = require('./data.json');
const { access_token, pixel_id } = require('./config');
const bizSdk = require('facebook-nodejs-business-sdk');
const Content = bizSdk.Content;
const CustomData = bizSdk.CustomData;
const DeliveryCategory = bizSdk.DeliveryCategory;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const ServerEvent = bizSdk.ServerEvent;

console.log({access_token});

const api = bizSdk.FacebookAdsApi.init(access_token);

let current_timestamp = Math.floor(new Date() / 1000);

// eventParams: { 
//     eventName: 'Purchase', 
//     eventSourceUrl: 'http://jaspers-market.com/product/123', 
//     actionSource: 'website', 
// },
// customData: {
//     currency: 'usd',
//     price: 123.45,
//     content: {
//         productId: 'product123', 
//         quantity: 10, 
//         deliveryCategory: 'HOME',
//     },
// },
// user: { 
//     email: 'joe@eg.com', 
//     phones: ['12345678901', '14251234567'], 
//     ipAddress: `192.168.20.20`, 
//     userAgent: 'Mozilla/5.0', 
//     fbp: 'fb.1.1558571054389.1098115397', 
//     fbc: 'fb.1.1554763741205.AbCdEfGhIjKlMnOpQrStUvWxYz1234567890', 
// },

    
const createUserData = (email, phones, ipAddress, userAgent, fbp, fbc) => {
    const userData = new UserData();

    userData.setEmails([email])
    userData.setPhones(phones)
    // It is recommended to send Client IP and User Agent for Conversions API EventsuserData.
    userData.setClientIpAddress(ipAddress)
    userData.setClientUserAgent(userAgent)
    userData.setFbp(fbp)
    userData.setFbc(fbc);

    return userData;
};

const createContent = (productId, quantity, deliveryCategory) => {
    const content = new Content ();

    content.setId('product123')
    content.setQuantity(1)
    content.setDeliveryCategory(DeliveryCategory.HOME_DELIVERY);

    return content;
};

const createCustomData = (currency, price, contentData) => {
    const { productId, quantity, deliveryCategory } = contentData;
    const content = createContent(productId, quantity, deliveryCategory);
    const customData = new CustomData();
    customData.setContents([content])
    customData.setCurrency(currency)
    customData.setValue(price);

    return customData;
};

const createServerEvent = (eventName, eventSourceUrl, actionSource, user, customData ) => {
    const { email, phones, ipAddress, userAgent, fbp, fbc } = user;
    const { currency, price, content } = customData;
    const userData = createUserData(email, phones, ipAddress, userAgent, fbp, fbc);
    const customDataObj = createCustomData(currency, price, content);
    const serverEvent = new ServerEvent();

    serverEvent.setEventName(eventName)
    serverEvent.setEventTime(current_timestamp)
    serverEvent.setUserData(userData)
    serverEvent.setCustomData(customDataObj)
    serverEvent.setEventSourceUrl(eventSourceUrl)
    serverEvent.setActionSource(actionSource);

    return serverEvent;
};
/**
 * eventParams: { eventName, eventSourceUrl, actionSource }
 * customData: {
 *  currency,
 *  price,
 *  content: {
 *      productId, quantity, deliveryCategory
 *  },
 * }
 * user: { email, phones, ipAddress, userAgent, fbp, fbc }
 */
const createEventRequest = (eventParams, customData, user) => {
    const { eventName, eventSourceUrl, actionSource } = eventParams;
    const eventsData = [createServerEvent(eventName, eventSourceUrl, actionSource, user, customData)];
    return new EventRequest(access_token, pixel_id).setEvents(eventsData);
};

const makeRequest = () => {
    const eventRequest = createEventRequest();

    eventRequest.execute().then(
        response => {
            console.log('Response: ', response);
        },
        err => {
            console.error('Error: ', err);
        }
    );
};

const sendPurchaserEvent = () => {
    const { eventParams, customData, user } = requestData;
    const eventRequest = createEventRequest(eventParams, customData, user);

    eventRequest.execute().then(
        response => {
            console.log('Response: ', response);
            return response;
        },
        err => {
            console.error('Error: ', err);
            return err;
        }
    );
};

sendPurchaserEvent();

exports.makeRequest = makeRequest;