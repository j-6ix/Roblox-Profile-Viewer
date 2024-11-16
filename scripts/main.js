async function getRobloxCookie() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getCookie" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(`Error: ${chrome.runtime.lastError.message}`);
      } else if (response && response.success) {
        resolve(response.cookie);
      } else {
        reject(response ? response.error : "Failed to retrieve cookie.");
      }
    });
  });
}

async function fetchRobloxData() {
  try {
    const robloxCookie = await getRobloxCookie();

    const headers = {
      "Content-Type": "application/json",
      Cookie: `.ROBLOSECURITY=${robloxCookie}`,
    };

    const userInfoResponse = await fetch("https://users.roblox.com/v1/users/authenticated", {
      credentials: "include",
      headers
    });
    if (!userInfoResponse.ok) throw new Error("Failed to fetch user info.");
    const userInfo = await userInfoResponse.json();

    const robuxResponse = await fetch(`https://economy.roblox.com/v1/users/${userInfo.id}/currency`, {
      credentials: "include",
      headers
    });
    if (!robuxResponse.ok) throw new Error("Failed to fetch Robux info.");
    const robuxInfo = await robuxResponse.json();

    const premiumResponse = await fetch("https://premiumfeatures.roblox.com/v1/users/current", {
      credentials: "include",
      headers
    });
    const premiumInfo = premiumResponse.ok ? await premiumResponse.json() : { isPremium: false };

    const friendsResponse = await fetch(`https://friends.roblox.com/v1/users/${userInfo.id}/friends/count`, {
      credentials: "include",
      headers
    });
    if (!friendsResponse.ok) throw new Error("Failed to fetch friends info.");
    const friendsInfo = await friendsResponse.json();

    const followersResponce = await fetch(`https://friends.roblox.com/v1/users/${userInfo.id}/followers/count`, {
      credentials: "include",
      headers
    })
    if (!followersResponce.ok) throw new Error("Failed to fetch followers info.")
    const followersInfo = await followersResponce.json()

    const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userInfo.id}&size=150x150&format=Png&isCircular=false`, {
      credentials: "include",
      headers,
    });
    if (!avatarResponse.ok) throw new Error("Failed to fetch avatar info.");
    const avatarInfo = await avatarResponse.json();

    const avatarUrl = avatarInfo.data[0]?.imageUrl; 

    const avatarImage = document.getElementById("avatarImage");
    avatarImage.src = avatarUrl;
    document.getElementById("username").innerHTML = `<strong>Username:</strong> ${userInfo.name}`;
    document.getElementById("id").innerHTML = `<strong>ID:</strong> ${userInfo.id}`;
    document.getElementById("display-name").innerHTML = `<strong>Display Name:</strong> ${userInfo.displayName}`;
    document.getElementById("robux").innerHTML = `<strong>Robux:</strong> ${robuxInfo.robux}`;
    document.getElementById("premium").innerHTML = `<strong>Premium Status:</strong> ${premiumInfo.isPremium ? "Yes" : "No"}`;
    document.getElementById("friends").innerHTML = `<strong>Friends:</strong> ${friendsInfo.count}`;
    document.getElementById("followers").innerHTML = `<strong>Followers:</strong> ${followersInfo.count}`;
    document.getElementById("cookie").innerHTML = `<strong>.ROBLOSECURITY:</strong> ${robloxCookie}`
  } catch (error) {
    console.error(error);
    document.getElementById("content").innerHTML = `<h1><b>Error:</b> ${error.message}<h1>`;
  }
}

fetchRobloxData();