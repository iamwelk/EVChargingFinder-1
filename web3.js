const web3 = new Web3(
  new Web3.providers.WebsocketProvider(
    "wss://sepolia.infura.io/ws/v3/18219f234a874bed9cde55db88d2b49b"
  )
);

const reservationAddress = "0x84bB344DD2D46eB3258dbE30fD253dAD40e9d4e1";
const serviceAddress = "0xfc7B0311E6d858B6014cdbdC39dB7f9f1c6C95B3";
const accountAddress = "0x9B4E3318d94425d4c1f9E36A34aeE26219B44536";
const accountABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "serviceAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "url",
        type: "string",
      },
      {
        internalType: "string",
        name: "path",
        type: "string",
      },
    ],
    name: "requestAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
const reservationABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "serviceAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "url",
        type: "string",
      },
      {
        internalType: "string",
        name: "path",
        type: "string",
      },
    ],
    name: "makeReservation",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
const serviceABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "ChainlinkCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "ChainlinkFulfilled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "ChainlinkRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "string",
        name: "requestType",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "result",
        type: "string",
      },
    ],
    name: "RequestMade",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_requestId",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "_result",
        type: "string",
      },
    ],
    name: "fulfill",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "requestType",
        type: "string",
      },
      {
        internalType: "string",
        name: "url",
        type: "string",
      },
      {
        internalType: "string",
        name: "path",
        type: "string",
      },
    ],
    name: "request",
    outputs: [
      {
        internalType: "bytes32",
        name: "requestId",
        type: "bytes32",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "result",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawLink",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const reservationContract = getContract(reservationABI, reservationAddress);
const serviceContract = getContract(serviceABI, serviceAddress);
const accountContract = getContract(accountABI, accountAddress);

let reservationCode;
let accountResponse;
let walletAddress;

document.addEventListener("DOMContentLoaded", async () => {
  const submit = document.getElementById("submit");
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    document
      .getElementById("connectWalletBtn")
      .addEventListener("click", async () => {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          walletAddress = accounts[0];
          document.getElementById("connectWalletBtn").innerText = walletAddress;
          submit.classList.remove("hidden");
        } catch (error) {
          console.error("Error connecting to wallet:", error);
        }
      });
  } else {
    console.error("MetaMask is not installed");
  }
});

document.getElementById("reservation").addEventListener("click", async () => {
  try {
    if (walletAddress === null) return;
    const url = "http://endpoint-dun.vercel.app/api/reservation";
    const path = "message,reservationCode";
    await reservationContract.methods.makeReservation(url, path).call();
    transaction(walletAddress, accountResponse, "0.0000000001");
  } catch (error) {
    console.error("Error calling reservationContract method:", error);
  }
});

document.getElementById("pay").addEventListener("click", async () => {
  try {
    if (walletAddress === null) return;
    const url = "http://endpoint-dun.vercel.app/api/account";
    const path = "message,account";
    await accountContract.methods.requestAccount(url, path).call();
    // serviceContract.events
    //   .RequestMade(
    //     {
    //       filter: {
    //         myIndexedParam: [20, 21],
    //         myOtherIndexedParam: "0x123456789...",
    //       }, // Using an array means OR: e.g. 20 or 23
    //       fromBlock: 0,
    //     },
    //     function () {}
    //   )
    //   .on("data", function (event) {})
    //   .on("changed", function (event) {
    //     // remove event from local database
    //   })
    //   .on("error", console.error);
    transaction(walletAddress, accountResponse, "0.0000362");
  } catch (error) {
    console.error("Error calling accountContract method:", error);
  }
});

function transaction(from, to, amount) {
  const web3 = new Web3(window.ethereum);
  window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then((accounts) => {
      const fromAddress = from;
      const toAddress = to;
      const amountInWei = web3.utils.toWei(amount, "ether");
      const transactionObject = {
        from: fromAddress,
        to: toAddress,
        value: amountInWei,
        gas: 21000,
      };

      web3.eth
        .sendTransaction(transactionObject)
        .then((receipt) => {
          console.log("Transaction receipt:", receipt);
        })
        .catch((error) => {
          console.error("Transaction error:", error);
        });
    })
    .catch((error) => {
      console.error("MetaMask connection error:", error);
    });
}

function getContract(abi, address) {
  return new web3.eth.Contract(JSON.parse(JSON.stringify(abi)), address);
}

serviceContract.events
  .RequestMade(
    {
      fromBlock: 0,
      toBlock: "latest",
    },
    function (error, event) {
      console.log(event);
    }
  )
  .on("data", function (event) {
    if (event.returnValues.requestType === "Reservation")
      reservationCode = event.returnValues.result;
    else {
      accountResponse = event.returnValues.result;
    }
    console.log(reservationCode);
    console.log(accountAddress);
  })
  .on("changed", function (event) {})
  .on("error", console.error);
