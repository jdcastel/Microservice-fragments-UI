// src/app.js

import { Auth, getUser } from './auth';
import { post } from './post';
const API_URL = process.env.API_URL;

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  //post text
  const postTextBtn = document.querySelector("#post");

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  await getFragments(user);

  async function getFragments(user) {
    try {
      const response = await fetch(`${API_URL}/v1/fragments`, {
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });
        const fragments = await response.json();
        console.log('Fragments after login User:', fragments);
    } catch (err) {
      console.error('Error making GET request:', err);
    }
  }

  postTextBtn.onclick = async () => {
    const formData = new FormData(document.getElementById("fragmentForm"));
    const fragmentText = formData.get("fragmentData");
    const fragmentType = formData.get("fragmentType");

    await post(user, fragmentText, fragmentType);
  };

  document.querySelector("#submitGet").onclick = async () => {
    const selectedOption = document.querySelector('#getOptions').value;
    const fragmentId = document.querySelector('#fragmentId').value;

    switch (selectedOption) {
      case '1':
        await get('/v1/fragments');
        break;
      case '2':
        await get('/v1/fragments?expand=1');
        break;
      case '3':
        await get(`/v1/fragments/${fragmentId}`);
        break;
      case '4':
        await get(`/v1/fragments/${fragmentId}/info`);
        break;
      default:
        console.error('Invalid option selected');
    }
  };

  async function get(endpoint) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });
        const contentType = response.headers.get('Content-Type');

        if (contentType && contentType.includes('application/json')) {
          const responseData = await response.json();
          console.log('Response from server:', responseData);
        } else {
          const responseText = await response.text();
          console.log('Response from server:', responseText);
        }
    } catch (err) {
      console.error('Error making GET request:', err);
    }
  }
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);