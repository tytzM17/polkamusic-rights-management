import { web3FromSource } from '@polkadot/extension-dapp';
// import { u8aToHex } from '@polkadot/util';


const getFromAcct = async (krpair, api, callback = null) => {
  if (!krpair || !api) return

  const {
    address,
    meta: { source, isInjected }
  } = krpair;
  let fromAcct;

  if (isInjected) {
    const injected = await web3FromSource(source);

    fromAcct = address;
    api.setSigner(injected.signer);
  } else {
    fromAcct = krpair;
  }

  if (callback) callback(fromAcct)
}

export default getFromAcct