/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
let swRegistration = null;
let isSubscribed = false;

export function handlePushNotification() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      console.log('Service Worker and Push is supported');

      navigator.serviceWorker.ready
        .then(swReg => {
          console.log('Service Worker is registered', swReg);

          swRegistration = swReg;
          verifySubscription();
        })
        .catch(err => {
          console.error('Service Worker Error', err);
        });
    });
  } else {
    console.warn('Push messaging is not supported');
  }

  if (!('Notification' in window)) {
    console.log('Notifications not supported in this browser');
    return;
  }

  Notification.requestPermission(status => {
    console.log('Notification permission status:', status);
  });

}

export function handleSubscription() {
  swRegistration.pushManager.getSubscription()
    .then(subscription => {
      isSubscribed = (subscription !== null);

      updateSubscriptionOnServer(subscription);

      if (isSubscribed) {
        unsubscribeUser();
      } else {
        subscribeUser();
      }
    });
}

export function verifySubscription() {
  swRegistration.pushManager.getSubscription()
    .then(subscription => {
      isSubscribed = (subscription !== null);

      updateSubscriptionOnServer(subscription);

      if (isSubscribed) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }
    });

}

export function subscribeUser() {
  const applicationServerPublicKey = 'BHQ9RlQ3EH5PTn3hDcN-5LKXmeBbtv5Aup4rvYaiE3DkLmrIZmUiS0moyK5hByu3Akf3Yf5nvc6nKePZm7DuF8U';

  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
    .then(subscription => {
      console.log('User is subscribed:', subscription);
      updateSubscriptionOnServer(subscription);

    })
    .catch(err => {
      if (Notification.permission === 'denied') {
        console.warn('Permission for notifications was denied');
      } else {
        console.error('Failed to subscribe the user: ', err);
      }
    });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
    .then(subscription => {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(err => {
      console.log('Error unsubscribing', err);
    })
    .then(() => {
      updateSubscriptionOnServer(null);
      console.log('User is unsubscribed');
    });
}

function updateSubscriptionOnServer(subscription) {
  const subscriptionJson = document.querySelector('#subscription-object');
  const pushSubscriptionToggler = document.querySelector('#push-subscription-toggler');
  const pushNotification = document.querySelector('#push-notification');

  if (subscription) {
    subscriptionJson.textContent = "Subscription Object: " + JSON.stringify(subscription);
    subscriptionJson.style.display = 'inline';
    pushSubscriptionToggler.textContent = "Disable Push Messaging";
    pushNotification.disabled = false;
  } else {
    subscriptionJson.style.display = 'none';
    pushSubscriptionToggler.textContent = "Enable Push Messaging";
    pushNotification.disabled = true;
  }

  console.log("subcription object " + JSON.stringify(subscription))
}

export function displayNotification() {
  if (Notification.permission == 'granted') {
    navigator.serviceWorker.getRegistration().then(reg => {
      const options = {
        body: 'First notification!',
        icon: './notification-flat.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        },
        actions: [
          {
            action: 'explore', title: 'Go to the site',
            icon: 'images/checkmark.png'
          },
          {
            action: 'close', title: 'Close the notification',
            icon: 'images/xmark.png'
          },
        ]
      };
      reg.showNotification('You are notified', options);
    });
  }
}

export function publishMessage() {
  swRegistration.pushManager.getSubscription()
    .then(subscription => {
      isSubscribed = (subscription !== null);

      updateSubscriptionOnServer(subscription);

      if (isSubscribed) {
        postMessage(subscription);
      } else {
        console.log('User is NOT subscribed.');
      }
    });
}

function postMessage(subscription) {
  const requestOptions = {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: 'React POST Request Example', ref: subscription})
  };

  fetch('https://us-central1-push-notification-fb70f.cloudfunctions.net/app/push-notification', requestOptions)
    .then(response => console.log("sent successfully"))
    .catch((error) => { console.log("failed to send" + error) });
}

export function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

