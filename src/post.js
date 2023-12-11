const API_URL = process.env.API_URL;

export const post = async (user, fragmentBody, fragmentType) => {
    try {
      // console.log("idtoken", user.idToken);
      // console.log("apiulrl", API_URL);
  console.log('object', fragmentBody);
      // const response = await fetch(`${API_URL}/v1/fragments/`, {
       const response = await fetch(`${API_URL}/v1/fragments/`, {

        method: "POST",
        body: fragmentBody,
        headers: {
          Authorization: `Bearer ${user.idToken}`,
          "Content-Type": fragmentType,
        },
      });
  
      const responseData = await response.json();
      console.log("Response from server:", responseData);
  
      if (response.ok) {
        //const fragmentContainer = document.createElement("div");
        //fragmentContainer.innerHTML = `<p>ID: ${responseData.fragment.id}, Type: ${responseData.fragment.type}</p>`;
        //document.body.appendChild(fragmentContainer);
      }
    } catch (error) {
      console.error("Error making POST request:", error);
    }
  };
  