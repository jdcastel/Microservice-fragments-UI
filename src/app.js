// src/app.js

import { Auth, getUser } from './auth';
import { getFragmentsbyUser } from "./api";
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

  postTextBtn.onclick = async () => {
    const formData = new FormData(document.getElementById("fragmentForm"));
  const fragmentText = formData.get("fragment");
  try {
    const response = await fetch(`${API_URL}/v1/fragments`, {
      method: "POST",
      body: fragmentText,
      headers: {
        Authorization: `Bearer ${user.idToken}`,
        "Content-Type": "text/plain",
      },
    });
    const responseData = await response.json();
    console.log("Response from server:", responseData);
    if (response.ok) {
      const fragmentContainer = document.createElement("div");
      fragmentContainer.textContent = fragmentText;
      document.body.appendChild(fragmentContainer);
    }
  } catch (error) {
    console.error("Error making POST request:", error);
  }
  };
  getFragmentsbyUser(user);
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);