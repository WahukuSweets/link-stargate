/*
1. Build issues
2. Don't store private key, just derive it (is this the right approach? Just want to confirm). 
  At some point we'll add encrypted storage to Snaps (this is what Metamask does: we encrypt them to disk everytime, and only have them unencrypted in memory. 
  If you ever store it to disk, you need to encrypt it first.)
  Usually key derivation is reasonably cheap (just do it once and then reuse while snap is running)
  For Solana it's so cheap that it's not a problem.
3. Dev issues (having to uninstall every time). This will be fixed. if you use the eth-denver-2022 branch of the extension, it will reinstall whenever you connect,
For now, use yarn start --build-type flask (for the local extension)
4. Any tips on how to learn Solana's approach to go from Extended Private Key => Solana Private Key

Virtual hackathon ends on March 20th! Once it's live, we can be on a community call / discuss promotion. 
*/

const { deriveBIP44AddressKey } = require('@metamask/key-tree');
const bs58 = require('bs58');
const nacl = require('tweetnacl')
const ethers = require('ethers')
const axiosOriginal = require('axios')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const adapter = require('axios/lib/adapters/xhr')
const axios = axiosOriginal.create({adapter})
const web3 = require('@solana/web3.js/lib/index.cjs');
// This import causes build issues
// const certusone = require("@certusone/wormhole-sdk");

wallet.registerRpcMessageHandler(async (originString, requestObject) => {

  switch (requestObject.method) {
    // case 'getAccount':
    //   return pubKey;

    // case 'callContract':
    //   return await callEvaluatorContract(requestObject.params[0] || 1);

    case 'send':
      await wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Hello!`,
            description:
              'Please approve your bridging transactions',
            textAreaContent:
              'We will be using Wormhole to bridge between your SOL and ETH assets within Metamask',
          },
        ],
      })
      return await sendTransaction(requestObject.amount)

    case 'create':
      return await createSolPrivateKey()
      
    default:
      throw new Error('Method not found.');
  }
});

//   /*
//   Solrise wallet team is talking about the same exact issue. They are doing different stuff than the Metamask key derivation stuff
//   does. Solana is doing it a bit differently. So we need to push an update.

//   Also, there is a way around it. Just need to confirm with Solrise team. We expected all chains to implement BIP44 to the letter.
//   This will be resolved in time for the hackathon

//   For now we can just import the private key

//   Solrise wants to make meta mask work with their wallet/app. (not the other way around like we are)
  
//   Can we get an intro to the Solrise team? (they know how it works)

//   */


async function sendTransaction(txAmount) {
  console.log("Amount:", txAmount)
  const solBip44CoinTypeNode = await wallet.request({
    method: 'snap_getBip44Entropy_501',
  });
  
  // Key Management/Derivation for Solana private and public keys
  const solExtendedPrivateKey = deriveBIP44AddressKey(solBip44CoinTypeNode, {
    account: 0,
    change: 0,
    address_index: 0,
  });
  const solKeyPair = nacl.sign.keyPair.fromSeed(solExtendedPrivateKey.slice(0, 32));
  const solPrivateKey = bs58.encode(solKeyPair.secretKey);
  const solPublicKey = bs58.encode(solKeyPair.publicKey);
  console.log("SolPrivateKey:", solPrivateKey);
  console.log("SolPublicKey:", solPublicKey);

  // Key Management/Derivation for Ethereum private and public keys
  const ethBip44CoinTypeNode = await wallet.request({
    method: 'snap_getBip44Entropy_60',
  });
  const ethExtendedPrivateKey = deriveBIP44AddressKey(ethBip44CoinTypeNode, {
    account: 0,
    change: 0,
    address_index: 0,
  });
  const ethPrivateKey = ethExtendedPrivateKey.slice(0,32).toString("hex")
  const ethWallet = new ethers.Wallet(ethExtendedPrivateKey.slice(0,32))
  const ethPublicKey = ethWallet.address
  console.log("EthPrivateKey:", ethPrivateKey)
  console.log("EthPublicKey:", ethPublicKey)

  let postBody = {
    amount: txAmount, 
    ETH_PV_KEY: ethPrivateKey,
    ETH_PUB_KEY: ethPublicKey,
    ETH_ERC20_ADDRESS: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    SOL_PV_KEY: solPrivateKey,
    SOL_PUB_KEY: solPublicKey,
    SOL_SPL_TOKEN_ADDRESS: "A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM"
  }
  console.log("Post body from snap:", postBody)
  return postBody
}


async function createSolPrivateKey() {
  const solBip44CoinTypeNode = await wallet.request({
    method: 'snap_getBip44Entropy_501',
  });

  // Key Management/Derivation for Solana private and public keys
  const solExtendedPrivateKey = deriveBIP44AddressKey(solBip44CoinTypeNode, {
    account: 0,
    change: 0,
    address_index: 0,
  });
  const solKeyPair = nacl.sign.keyPair.fromSeed(solExtendedPrivateKey.slice(0, 32));
  const solPrivateKey = bs58.encode(solKeyPair.secretKey);
  const solPublicKey = bs58.encode(solKeyPair.publicKey);
  let solObj = {privKey:solPrivateKey, pubKey: solPublicKey}
  return solObj;
}