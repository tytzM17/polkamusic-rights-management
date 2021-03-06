import isEqual from 'lodash.isequal'
import getFromAcct from './getFromAcct'
import getKrPair from './getKrPair'
import signAndSendEventsHandler from './signAndSendEventsHandler'
import getRandomFromRange from './getRandomIntFromRange'
import { web3FromAddress } from '@polkadot/extension-dapp';

const updateMasterData = async (
    changeID,
    capturedMasterData,
    nodeFormikMasterValues,
    api,
    addressValues,
    keyringAccount,
    notifyCallback,
    otherCallback = null
) => {

    if (!capturedMasterData || !api) return

    if (isEqual(capturedMasterData, nodeFormikMasterValues)) {
        console.log(`No changes in master data with ID ${changeID}`)
        return
    }

    let updated = false

    // get kr pair
    const krPair = getKrPair(addressValues, keyringAccount)

    // get from account/ wallet
    let frmAcct;
    if (!krPair) {
        notifyCallback('Keyring pair not found, aborting crm data update', 'error')
        return
    }
    await getFromAcct(krPair, api, (response) => frmAcct = response)

    // check wallet(frmAcct type is string) or dev acct
    let nonceAndSigner = { nonce: -1 };

    if (typeof frmAcct === 'string') {
        const injector = await web3FromAddress(frmAcct).catch(console.error);
        nonceAndSigner['signer'] = injector?.signer
    }

    const uniqueRandId = getRandomFromRange(300, 4000)
    const parsedUniqRandId = parseInt(uniqueRandId)

    // transact
    const crmMasterDataUpdate = api.tx.crm.changeProposalCrmMasterdata(
        parsedUniqRandId,
        JSON.stringify({ crmid: parseInt(changeID), master: nodeFormikMasterValues })
    )

    await crmMasterDataUpdate.signAndSend(
        frmAcct,
        nonceAndSigner,
        ({ status, events }) => {
            signAndSendEventsHandler(
                events,
                notifyCallback,
                api,
                `CRM Master Data with ID ${changeID} change proposal success!`)
        }
    );

    if (otherCallback) otherCallback({
        updateArea: 'master', changeId: parsedUniqRandId, masterUpdateData: {
            crmid: parseInt(changeID), master: nodeFormikMasterValues
        }
    })

    updated = true
    return updated
}

export default updateMasterData