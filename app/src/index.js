import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      // Set Title
      App.setTitle();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  setTitle: async function() {
    // Retrieve contract function
    const { starName } = this.meta.methods;
    const { starSymbol } = this.meta.methods;

    // Call to contract function
    const name = await starName().call();
    const symbol = await starSymbol().call();

    const title = document.getElementById("title");
    title.innerHTML = "StarNotary Token: " + symbol + " - " + name;
  },

  createStar: async function() {
    // Retrieve contract function
    const { createStar } = this.meta.methods;

    // Prepare params
    const name = document.getElementById("starName").value;
    const symbol = document.getElementById("starSymbol").value;
    const id = document.getElementById("starId").value;

    // Call to contract function
    await createStar(name, symbol, id).send({from: this.account});

    // Send feedback to user
    App.setStatus("New Star Owner is " + this.account + ".");
  },

  lookUp: async function (){
    // Retrieve contract function
    const { lookUptokenIdToStarInfo } = this.meta.methods;

    // Prepare params
    const tokenId = document.getElementById("lookid").value;

    // Call to contract function
    const info = await lookUptokenIdToStarInfo(tokenId).call();

    // Send feedback to user
    App.setStatus("Star Info: " + info + ".");
  },

  exchangeStar: async function (){
    // Retrieve contract function
    const { exchangeStars } = this.meta.methods;

    // Prepare params
    let status = 'fails';
    const star1 = document.getElementById("exchangeStarId1").value;
    const star2 = document.getElementById("exchangeStarId2").value;

    // Call to contract function
    await exchangeStars(star1, star2).send({from: this.account});
  },

  transferStar: async function (){
    // Retrieve contract function
    const { transferStar } = this.meta.methods;

    // Prepare params
    let status = 'fails';
    const starId = document.getElementById("transferStarId").value;
    const addressTo = document.getElementById("addresTo").value;

    // Call to contract function
    await transferStar(addressTo, starId).send({from: this.account});
  }
};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"),);
  }

  App.start();
});