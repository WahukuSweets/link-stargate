const { deriveBIP44AddressKey } = require('@metamask/key-tree');
const { Contract, compileCalldata, defaultProvider, ec } = require('starknet');
// const AccountContractAbi = require('./contracts/Account.json');
const AccountContractAbi = require('./contracts/ArgentAccount.json');
const EvaluatorContractAbi = require('./contracts/Evaluator.json');

let isInitialized = false;
let keyPair;
let pubKey;

const EVALUATOR_ADDRESS =
  '0x03b56add608787daa56932f92c6afbeb50efdd78d63610d9a904aae351b6de73';

wallet.registerRpcMessageHandler(async (originString, requestObject) => {
  if (!isInitialized) {
    await initialize();
  }

  switch (requestObject.method) {
    case 'getAccount':
      return pubKey;

    case 'callContract':
      return await callEvaluatorContract(requestObject.params[0] || 1);

    case 'hello':
      return wallet.request({
        method: 'snap_confirm',
        params: [
          {
            prompt: `Hello, ${originString}!`,
            description:
              'This custom confirmation is just for display purposes.',
            textAreaContent:
              'But you can edit the snap source code to make it do something, if you want to!',
          },
        ],
      });

    default:
      throw new Error('Method not found.');
  }
});

async function initialize() {
  isInitialized = true;

  const bip44CoinTypeNode = await wallet.request({
    method: 'snap_getBip44Entropy_9004',
  });

  const extendedPrivateKey = deriveBIP44AddressKey(bip44CoinTypeNode, {
    account: 0,
    change: 0,
    address_index: 0,
  });
  const privateKey = extendedPrivateKey.slice(0, 32);

  console.log(`PRIVATE KEY: ${privateKey}`);
  keyPair = ec.getKeyPair(privateKey);
  console.log(`KEY PAIR: ${keyPair}`);
  pubKey = ec.getStarkKey(keyPair);
  console.log(`PUB KEY: ${pubKey}`);
}

async function callEvaluatorContract(action) {
  const contract = new Contract(EvaluatorContractAbi.abi, EVALUATOR_ADDRESS);
  try {
    let result;
    switch (action) {
      case 1:
        result = await contract.call('isTeacher', [pubKey]);
        break;

      case 2:
        result = await contract.call('tderc20_address');
        break;

      case 3:
        result = await contract.invoke('submit_exercise', [
          '1275531042410203803284618261751248047487169119430392381923537660588385039105',
        ]);
        break;

      default:
        throw new Error('unknown action');
    }

    console.log('Received result!', result);
    return result;
  } catch (error) {
    console.error('CALL ERROR', error);
  }
}
