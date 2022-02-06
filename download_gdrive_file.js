/*
A simple Cloudflare web worker to download Google Drive file.
Just pass the gdrive file Id like this: https://abc.workers.dev/file?id=<fileId>
This code is extracted from https://gitlab.com/ParveenBhadooOfficial/Google-Drive-Index/-/tree/master/worker/worker-multiple-drives.js
*/
const authConfig = {
  "client_id": "",
  "client_secret": "",
  "refresh_token": ""
};

class googleDrive {
  constructor(authConfig) {
    this.authConfig = authConfig;
  }

  async accessToken() {
    console.log("accessToken setup started");
    if (this.authConfig.expires == undefined || this.authConfig.expires < Date.now()) {
      const obj = await this.fetchAccessToken();
      if (obj.access_token != undefined) {
        this.authConfig.accessToken = obj.access_token;
        this.authConfig.expires = Date.now() + 3500 * 1000;
        console.log("accessToken setup completed");
      }
      else {
        console.log("failed to set accessToken");
      }
    }
    return this.authConfig.accessToken;
  }

  async fetchAccessToken() {
    console.log("building params");
    const url = "https://www.googleapis.com/oauth2/v4/token";
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    var post_data = {
      client_id: this.authConfig.client_id,
      client_secret: this.authConfig.client_secret,
      refresh_token: this.authConfig.refresh_token,
      grant_type: "refresh_token",
    };
    let requestOption = {
      'method': 'POST',
      'headers': headers,
      'body': this.enQuery(post_data)
    };
    console.log("fetching googleapi");
    const response = await fetch(url, requestOption);
    return await response.json();
  }

  enQuery(data) {
    const ret = [];
    for (let d in data) {
      ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    }
    return ret.join('&');
  }

  async requestOption(headers = {}, method = 'GET') {
    const accessToken = await this.accessToken();
    headers['authorization'] = 'Bearer ' + accessToken;
    return {
      'method': method,
      'headers': headers
    };
  }

  sleep(ms) {
    return new Promise(function(resolve, reject) {
      let i = 0;
      setTimeout(function() {
        i++;
        if (i >= 2) reject(new Error('i>=2'));
        else resolve(i);
      }, ms);
    });
  }

  async download(id, range = '', inline = false) {
    let url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
    let requestOption = await this.requestOption();
    requestOption.headers['Range'] = range;
    let response;
    for (let i = 0; i < 3; i++) {
      response = await fetch(url, requestOption);
      if (response.status === 200) { break; }
      await this.sleep(800 * (i + 1));
    }
    if (response.ok) {
      const {headers} = response = new Response(response.body, response);
      headers.append('Access-Control-Allow-Origin', '*');
      headers.set('Content-Disposition', 'inline');
      return response;
    } else {
      return new Response("Failed to get file data", {
        headers: {
          "content-type": "text/html;charset=UTF-8",
        },
        status: 500,
        statusText: "Internal Server Error"
      });
    }
  }
}

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const { searchParams } = new URL(request.url);
  let fileId = searchParams.get('id');
  if (fileId != null || fileId != undefined) {
    let range = request.headers.get('Range');
    const gd = new googleDrive(authConfig);
    return gd.download(fileId, range, true);
  } else {
    return new Response("File ID missing", {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
      status: 500,
      statusText: "Internal Server Error"
    });
  }
}
