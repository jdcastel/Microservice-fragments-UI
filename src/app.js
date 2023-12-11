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
  
  //Controls
  const fragmentType = document.getElementById('fragmentType');
  const getOptions = document.getElementById('getOptions');
  const fragmentImage = document.getElementById('fragmentImage');
  const fragmentBody = document.getElementById('fragmentBody');
  const fragmentBodyIds = document.getElementById('fragmentBodyIds');

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

  //await getFragments(user);
  await getFragments('/v1/fragments?expand=1');

  async function getFragments(endpoint) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });
        console.log('object');
        const fragments = await response.json();
        console.log('Fragments after login User:', fragments);
        const selectedOption = document.querySelector('#getOptions').value;

        console.log('selectedOption', selectedOption);

        switch (selectedOption) {
          case '1':
            fragmentBody.innerHTML = "";
            fragments.fragments.map((fragment) => {
              const tr = document.createElement('tr');
    
              let btnDelete = document.createElement('button');
              let btnDeleteText = document.createTextNode('Delete');
              let btnEdit = document.createElement('button');
              let btnEditText = document.createTextNode('Edit');
              let btnConvert = document.createElement('button');
              let btnConvertText = document.createTextNode('Convert');
              let cellButtons = document.createElement('td');

              btnDelete.onclick = async () => {
                await deleteUserFragment(fragment['id']);
                location.reload();
              };

              btnEdit.onclick = async () => {
                document.getElementById('fragmentTypeData').value = fragment['type'];
                document.getElementById('fragmentIdData').value = fragment['id'];

                document.getElementById('divEditFragment').hidden = false;
                document.getElementById('divConvertFragment').hidden = true;

                if(fragment['type'].includes('image/')){
                  document.getElementById('divEditImage').hidden = false;
                  document.getElementById('divEditData').hidden = true;
                }else{
                  document.getElementById('divEditImage').hidden = true;
                  document.getElementById('divEditData').hidden = false;
                }

                openModal();
              };

              btnConvert.onclick = async () => {
                document.getElementById('fragmentTypeData').value = fragment['type'];
                document.getElementById('fragmentIdData').value = fragment['id'];
                
                document.getElementById('divEditFragment').hidden = true;
                document.getElementById('divConvertFragment').hidden = false;
                
                var selectConv = document.getElementById('selectConvert');

                var i, L = selectConv.options.length -1;
                for(i = L; i >= 0; i--){
                  selectConv.remove(i);
                } 

                if(fragment['type'].includes('text/plain')) {
                  ['.txt'].map( (x, i) => {
                    let opt = document.createElement("option");
                    opt.value = x; // the index
                    opt.innerHTML = x;
                    selectConvert.append(opt);
                  });
                }else if(fragment['type'].includes('text/markdown')){
                  ['.md','.html','.txt'].map( (x, i) => {
                    let opt = document.createElement("option");
                    opt.value = x; // the index
                    opt.innerHTML = x;
                    selectConvert.append(opt);
                  });
                }else if(fragment['type'].includes('text/html')){
                  ['.html','.txt'].map( (x, i) => {
                    let opt = document.createElement("option");
                    opt.value = x; // the index
                    opt.innerHTML = x;
                    selectConvert.append(opt);
                  });
                }else if(fragment['type'].includes('application/json')){
                  ['.json','.txt'].map( (x, i) => {
                    let opt = document.createElement("option");
                    opt.value = x; // the index
                    opt.innerHTML = x;
                    selectConvert.append(opt);
                  });
                }else if(fragment['type'].includes('image/')){
                  ['.png','.jpg','.webp','.gif'].map( (x, i) => {
                    let opt = document.createElement("option");
                    opt.value = x; // the index
                    opt.innerHTML = x;
                    selectConvert.append(opt);
                  });
                }

                openModal();
              };

              btnDelete.appendChild(btnDeleteText);
              btnEdit.appendChild(btnEditText);
              btnConvert.appendChild(btnConvertText);
              cellButtons.appendChild(btnDelete);
              cellButtons.appendChild(btnEdit);
              cellButtons.appendChild(btnConvert);
              tr.appendChild(cellButtons);


              ['id', 'ownerId', 'type', 'created', 'updated', 'size'].map((element) => {
                const text = document.createTextNode(fragment[element]);
                const td = document.createElement('td');
        
                td.appendChild(text);
                tr.appendChild(td);
              });
    
              fragmentBody.appendChild(tr);
            });
            break;
          case '2':
            fragmentBodyIds.innerHTML = "";
            fragments.fragments.map((fragment) => {
              const tr = document.createElement('tr');
              const text = document.createTextNode(fragment);
              const td = document.createElement('td');
              td.appendChild(text);
              tr.appendChild(td);
              fragmentBodyIds.appendChild(tr);
            });
            
            break;
          case '4':
            fragmentBodyIds.innerHTML = "";
            const tr = document.createElement('tr');
            ['id', 'ownerId', 'type', 'created', 'updated', 'size'].map((element) => {
              const text = document.createTextNode(fragments.fragment[element]);
              const td = document.createElement('td');
              td.appendChild(text);
              tr.appendChild(td);
            });
            fragmentBody.appendChild(tr);
            break;
        }
    } catch (err) {
      console.error('Error making GET request:', err);
    }
  }

  fragmentType.onchange = () => {
    if(['image/png','image/jpeg', 'image/webp', 'image/gif'].includes(fragmentType.value)){
      document.getElementById('divImage').hidden = false;
      document.getElementById('divData').hidden = true;
    }else{
      document.getElementById('divImage').hidden = true;
      document.getElementById('divData').hidden = false;
    }
  }


  postTextBtn.onclick = async () => {
    const formData = new FormData(document.getElementById("fragmentForm"));
    const fragmentBody = formData.get("fragmentData") || fragmentImage.files[0];
    const fragmentType = formData.get("fragmentType");

    await post(user, fragmentBody, fragmentType);

    location.reload();
  };

  document.querySelector("#submitGet").onclick = async () => {
    const selectedOption = document.querySelector('#getOptions').value;
    const fragmentId = document.querySelector('#fragmentId').value;

    switch (selectedOption) {
      case '1':
        await getFragments('/v1/fragments?expand=1');
        break;
        case '2':
          await getFragments('/v1/fragments');
          break;
      case '3':
        await get(`/v1/fragments/${fragmentId}`);
        break;
      case '4':
        await getFragments(`/v1/fragments/${fragmentId}/info`);
        break;
      case '5':
        await get('/v1/fragments/' + fragmentId + '.html');
      break;
      default:
        console.error('Invalid option selected');
    }
  };

  document.querySelector("#EditFragment").onclick = async () => {
    if(document.getElementById('fragmentTypeData').value.includes('image/')){
      await editFragment(document.getElementById('fragmentIdData').value, document.getElementById('fragmentEditImage').files[0]);
    }else{
      await editFragment(document.getElementById('fragmentIdData').value, document.getElementById('fragmentEditData').value);
    }

    location.reload();
  };

  document.querySelector("#ConvertFragment").onclick = async () => {
    await convertFragment(document.getElementById('fragmentIdData').value, document.getElementById('selectConvert').value);
    location.reload();
  };

  getOptions.onchange = () => {
    var tblFragmentIds = document.getElementById('tblFragmentIds');
    var tblFragment = document.getElementById('tblFragment');

    document.getElementById('fragmentContainer').innerHTML = '';
    document.getElementById('imageFragment').src = '';
    document.getElementById('fragmentId').value = '';

    if(getOptions.value === '1'){
      fragmentBody.innerHTML = "";
      document.getElementById('divFragmentId').hidden = true;
      tblFragmentIds.classList.remove("display");
      tblFragment.classList.add("display");
    }else if(getOptions.value === '2'){
      document.getElementById('divFragmentId').hidden = true;
      tblFragmentIds.classList.add("display");
      tblFragment.classList.remove("display");
    }else if(getOptions.value === '3'){
      document.getElementById('divFragmentId').hidden = false;
      tblFragmentIds.classList.remove("display");
      tblFragment.classList.remove("display");
    }else if(getOptions.value === '4'){
      fragmentBody.innerHTML = "";
      document.getElementById('divFragmentId').hidden = false;
      tblFragmentIds.classList.remove("display");
      tblFragment.classList.add("display");
    }
  }

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
          document.getElementById('fragmentContainer').innerHTML = syntaxHighlight(responseData);
        }else if(contentType && contentType.includes('image/')){
          const blob = await response.blob();

          var imageUrl = URL.createObjectURL(blob);
          console.log('image:', imageUrl);

          document.getElementById('imageFragment').src = imageUrl;
        } else {
          const responseText = await response.text();
          console.log('Response from server:', responseText);
          const fragmentContainer = document.getElementById("fragmentContainer");
          console.log('fragmentContainer:', fragmentContainer);
          fragmentContainer.innerHTML = responseText;
        }
    } catch (err) {
      console.error('Error making GET request:', err);
    }
  }

  async function deleteUserFragment(id) {
    try {
      const response = await fetch(`${API_URL}/v1/fragments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Deleted fragments data', { data });
        
    } catch (err) {
      console.error('Error making DELETE request:', err);
    }
  }

  async function editFragment(id, body) {
    try {
      const res = await fetch(`${API_URL}/v1/fragments/${id}`, {
        method: 'PUT',
        body: body,
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Edit fragment data', { data });
        
    } catch (err) {
      console.error('Error making DELETE request:', err);
    }
  }

  async function convertFragment(id,type) {
    try {
      const res = await fetch(`${API_URL}/v1/fragments/${id}${type}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.idToken}`,
        },
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      
      console.log('Convert fragment data', { res });
        
    } catch (err) {
      console.error('Error making CONVERT request:', err);
    }
  }

  //https://stackoverflow.com/questions/4810841/pretty-print-json-using-javascript
  function syntaxHighlight(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  var modal = document.getElementById("myModal");
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks the button, open the modal 
  function openModal() {
    modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  }

}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);